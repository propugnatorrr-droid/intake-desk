import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as client from '../api/client';
import { createTestRouter } from '../router';
import type { Intake, IntakeList } from '../types';

vi.mock('../api/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api/client')>();
  return { ...actual, listIntakes: vi.fn(), getIntake: vi.fn(), createIntake: vi.fn(), updateIntake: vi.fn() };
});

const mocked = vi.mocked(client);

const counts = { new: 1, contacted: 1, quoted: 0, won: 0, lost: 0 };

const intake = (overrides: Partial<Intake> = {}): Intake => ({
  id: 1,
  clientName: 'Marta Okafor',
  email: 'marta@harborpine.example',
  company: 'Harbor & Pine Outfitters',
  service: 'web-app',
  message: 'We need a booking portal for guided trips.',
  status: 'new',
  nextStatuses: ['contacted', 'lost'],
  createdAt: '2026-11-19T10:00:00Z',
  updatedAt: '2026-11-19T10:00:00Z',
  ...overrides,
});

const list = (items: Intake[]): IntakeList => ({ items, total: items.length, counts });

function renderAt(path: string) {
  const router = createTestRouter([path]);
  render(<RouterProvider router={router} />);
  return router;
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe('enquiry list', () => {
  it('shows each enquiry with its status', async () => {
    mocked.listIntakes.mockResolvedValue(list([intake(), intake({ id: 2, clientName: 'Daniel Reyes', status: 'contacted' })]));
    renderAt('/');

    expect(await screen.findByText('Marta Okafor')).toBeInTheDocument();
    expect(screen.getByText('Daniel Reyes')).toBeInTheDocument();
    expect(screen.getByText('2 enquiries shown')).toBeInTheDocument();
  });

  it('invites the first enquiry when the desk is empty', async () => {
    mocked.listIntakes.mockResolvedValue(list([]));
    renderAt('/');

    expect(await screen.findByText('The desk is clear')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Log the first enquiry' })).toBeInTheDocument();
  });

  it('explains an empty filtered result and offers to clear it', async () => {
    mocked.listIntakes.mockResolvedValue(list([]));
    renderAt('/?status=lost');

    expect(await screen.findByText('No enquiries match those filters')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear filters' })).toBeInTheDocument();
  });

  it('asks the server for the chosen status', async () => {
    mocked.listIntakes.mockResolvedValue(list([intake()]));
    renderAt('/');
    await screen.findByText('Marta Okafor');

    await userEvent.click(screen.getByRole('button', { name: /^Contacted/ }));

    await waitFor(() => expect(mocked.listIntakes).toHaveBeenLastCalledWith(expect.objectContaining({ status: 'contacted' }), expect.anything()));
  });

  it('shows a retry when the server cannot be reached', async () => {
    mocked.listIntakes.mockRejectedValue(new client.ApiError('We could not reach the server. Check your connection and try again.', 0));
    renderAt('/');

    expect(await screen.findByRole('alert')).toHaveTextContent('We could not reach the server');
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });
});

describe('new enquiry form', () => {
  it('lists every problem in a summary the user can jump from', async () => {
    mocked.createIntake.mockRejectedValue(
      new client.ApiError('Please fix the highlighted fields.', 422, {
        clientName: 'Enter the client name.',
        email: 'Enter an email address.',
      }),
    );
    renderAt('/new');

    await userEvent.click(await screen.findByRole('button', { name: 'Save enquiry' }));

    const summary = await screen.findByRole('alert');
    expect(summary).toHaveTextContent('There are 2 problems to fix');
    expect(screen.getByRole('link', { name: 'Enter the client name.' })).toHaveAttribute('href', '#clientName');
    expect(screen.getByLabelText('Client name')).toHaveAttribute('aria-invalid', 'true');
  });

  it('goes to the new record after a successful save', async () => {
    mocked.createIntake.mockResolvedValue(intake({ id: 7 }));
    mocked.getIntake.mockResolvedValue(intake({ id: 7 }));
    const router = renderAt('/new');

    await userEvent.type(await screen.findByLabelText('Client name'), 'Marta Okafor');
    await userEvent.type(screen.getByLabelText('Email'), 'marta@harborpine.example');
    await userEvent.selectOptions(screen.getByLabelText('Service needed'), 'web-app');
    await userEvent.type(screen.getByLabelText('What the client needs'), 'A booking portal.');
    await userEvent.click(screen.getByRole('button', { name: 'Save enquiry' }));

    await waitFor(() => expect(router.state.location.pathname).toBe('/intakes/7'));
  });
});

describe('enquiry detail', () => {
  it('offers only the next steps the workflow allows', async () => {
    mocked.getIntake.mockResolvedValue(intake());
    renderAt('/intakes/1');

    expect(await screen.findByRole('button', { name: 'Mark contacted' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mark lost' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Mark won' })).not.toBeInTheDocument();
  });

  it('moves the enquiry on and confirms it', async () => {
    mocked.getIntake
      .mockResolvedValueOnce(intake())
      .mockResolvedValue(intake({ status: 'contacted', nextStatuses: ['quoted', 'lost'] }));
    mocked.updateIntake.mockResolvedValue(intake({ status: 'contacted' }));
    renderAt('/intakes/1');

    await userEvent.click(await screen.findByRole('button', { name: 'Mark contacted' }));

    expect(await screen.findByText('Moved to Contacted.')).toBeInTheDocument();
    expect(mocked.updateIntake).toHaveBeenCalledWith(1, { status: 'contacted' });
  });

  it('keeps the edit form open on an error and closes it on Cancel', async () => {
    mocked.getIntake.mockResolvedValue(intake());
    mocked.updateIntake.mockRejectedValue(
      new client.ApiError('Please fix the highlighted fields.', 422, { email: 'That email address does not look right.' }),
    );
    renderAt('/intakes/1');

    await userEvent.click(await screen.findByRole('button', { name: 'Edit details' }));
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText('There is 1 problem to fix')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(await screen.findByRole('button', { name: 'Edit details' })).toBeInTheDocument();
    expect(screen.queryByText('There is 1 problem to fix')).not.toBeInTheDocument();
  });

  it('saves an edit and returns to the details with a confirmation', async () => {
    mocked.getIntake.mockResolvedValue(intake());
    mocked.updateIntake.mockResolvedValue(intake({ company: 'Harbor and Pine' }));
    renderAt('/intakes/1');

    await userEvent.click(await screen.findByRole('button', { name: 'Edit details' }));
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText('Changes saved.')).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Edit details' })).toBeInTheDocument();
  });

  it('says so plainly when the enquiry does not exist', async () => {
    mocked.getIntake.mockRejectedValue(new client.ApiError('That enquiry does not exist.', 404));
    renderAt('/intakes/99');

    expect(await screen.findByText('That enquiry is not here')).toBeInTheDocument();
  });

  it('treats a non-numeric id as not found', async () => {
    renderAt('/intakes/abc');

    expect(await screen.findByText('That enquiry is not here')).toBeInTheDocument();
    expect(mocked.getIntake).not.toHaveBeenCalled();
  });
});
