import styled from '@emotion/styled';
import { useEffect, useRef, useState } from 'react';
import { Form, Link, useActionData, useLoaderData, useNavigation, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router';
import { ApiError, getIntake, updateIntake } from '../api/client';
import { IntakeForm } from '../components/IntakeForm';
import { StatusBadge } from '../components/StatusBadge';
import { Button, Card, Eyebrow, Muted, PageTitle } from '../components/ui';
import { SERVICE_LABEL, STATUS_ACTION, STATUS_LABEL, formatWhen } from '../lib/labels';
import { useTitle } from '../lib/useTitle';
import { bp, color, font, space } from '../theme';
import type { FieldErrors, Intake, IntakeFields, StatusValue } from '../types';
import { readFields } from './NewPage';

interface ActionResult {
  ok: boolean;
  message: string;
  errors?: FieldErrors;
  values?: IntakeFields;
  intent: 'status' | 'edit';
}

function parseId(raw: string | undefined): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id < 1) throw new ApiError('That enquiry does not exist.', 404);
  return id;
}

export async function detailLoader({ params, request }: LoaderFunctionArgs): Promise<Intake> {
  return getIntake(parseId(params.id), request.signal);
}

export async function detailAction({ params, request }: ActionFunctionArgs): Promise<ActionResult> {
  const id = parseId(params.id);
  const form = await request.formData();
  const intent = form.get('intent') === 'edit' ? 'edit' : 'status';

  try {
    if (intent === 'status') {
      const status = String(form.get('status') ?? '') as StatusValue;
      await updateIntake(id, { status });
      return { ok: true, intent, message: `Moved to ${STATUS_LABEL[status]}.` };
    }

    const values = readFields(form);
    await updateIntake(id, values);
    return { ok: true, intent, message: 'Changes saved.' };
  } catch (error) {
    if (error instanceof ApiError) {
      const hasFieldErrors = Object.keys(error.fields).length > 0;
      return {
        ok: false,
        intent,
        message: error.message,
        values: intent === 'edit' ? readFields(form) : undefined,
        errors: intent === 'edit' ? (hasFieldErrors ? error.fields : { _: error.message }) : undefined,
      };
    }
    throw error;
  }
}

const Top = styled.div`
  display: grid;
  gap: ${space(1.5)};
  margin: ${space(1)} 0 ${space(3)};

  @media (min-width: ${bp.tablet}) {
    grid-template-columns: 1fr auto;
    align-items: start;
  }
`;

const CardTitle = styled.h2`
  margin-bottom: ${space(2)};
`;

const Columns = styled.div`
  display: grid;
  gap: ${space(3)};

  @media (min-width: ${bp.desktop}) {
    grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
    align-items: start;
  }
`;

const Facts = styled.dl`
  display: grid;
  gap: ${space(1.5)};
  margin: 0 0 ${space(3)};

  @media (min-width: ${bp.tablet}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  dt {
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-weight: 700;
    color: ${color.muted};
  }
  dd {
    margin: 2px 0 0;
    overflow-wrap: anywhere;
  }
`;

const Message = styled.blockquote`
  margin: 0;
  padding: ${space(2)} ${space(2.5)};
  border-left: 4px solid ${color.accent};
  background: rgba(224, 163, 58, 0.1);
  font-family: ${font.heading};
  font-size: 1.1rem;
  line-height: 1.6;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
`;

const Steps = styled.ol`
  list-style: none;
  margin: 0 0 ${space(3)};
  padding: 0;
  display: grid;
  gap: ${space(1.25)};
`;

const Step = styled.li<{ state: 'done' | 'current' | 'todo' }>`
  display: flex;
  align-items: center;
  gap: ${space(1.5)};
  font-weight: ${({ state }) => (state === 'current' ? 700 : 500)};
  color: ${({ state }) => (state === 'todo' ? color.muted : color.ink)};

  i {
    display: inline-grid;
    place-items: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    font-style: normal;
    font-size: 0.75rem;
    font-weight: 700;
    border: 2px solid ${({ state }) => (state === 'todo' ? color.lineStrong : color.primary)};
    background: ${({ state }) => (state === 'done' ? color.primary : state === 'current' ? color.surface : 'transparent')};
    color: ${({ state }) => (state === 'done' ? color.onPrimary : color.primary)};
  }
`;

const Moves = styled.div`
  display: grid;
  gap: ${space(1.25)};
`;

const Notice = styled.p<{ ok: boolean }>`
  margin-bottom: ${space(2)};
  padding: ${space(1.25)} ${space(2)};
  border-radius: 10px;
  font-weight: 600;
  background: ${({ ok }) => (ok ? '#d9efe0' : color.dangerSoft)};
  color: ${({ ok }) => (ok ? '#14502a' : color.danger)};
`;

const PATH: StatusValue[] = ['new', 'contacted', 'quoted', 'won'];

function stepsFor(status: StatusValue): { value: StatusValue; state: 'done' | 'current' | 'todo' }[] {
  const index = PATH.indexOf(status);
  return PATH.map((value, position) => ({
    value,
    state: status === 'lost' ? 'todo' : position < index ? 'done' : position === index ? 'current' : 'todo',
  }));
}

export function DetailPage() {
  const intake = useLoaderData() as Intake;
  const result = useActionData() as ActionResult | undefined;
  const navigation = useNavigation();
  const [editing, setEditing] = useState(false);
  // The action result stays around after Cancel, so remember which one the person has already dealt with.
  const [handled, setHandled] = useState<ActionResult | undefined>();
  const detailsRef = useRef<HTMLHeadingElement>(null);

  const saving = navigation.state === 'submitting';
  const editFailed = result?.intent === 'edit' && !result.ok && handled !== result;
  const showForm = editing || editFailed;
  const notice = result && !editFailed && handled !== result ? result : undefined;

  useTitle(intake.clientName);

  useEffect(() => {
    if (result?.intent === 'edit' && result.ok) {
      setEditing(false);
      detailsRef.current?.focus();
    }
  }, [result]);

  const startEditing = () => {
    setHandled(result);
    setEditing(true);
  };

  const stopEditing = () => {
    setHandled(result);
    setEditing(false);
    window.setTimeout(() => detailsRef.current?.focus(), 0);
  };

  return (
    <>
      <p>
        <Link to="/">← All enquiries</Link>
      </p>
      <Top>
        <div>
          <Eyebrow>{SERVICE_LABEL[intake.service]}</Eyebrow>
          <PageTitle>{intake.clientName}</PageTitle>
          <Muted>{intake.company || 'No company given'}</Muted>
        </div>
        <StatusBadge status={intake.status} />
      </Top>

      <div role="status" aria-live="polite">
        {notice && <Notice ok={notice.ok}>{notice.message}</Notice>}
      </div>

      <Columns>
        <Card aria-labelledby="details-title">
          {showForm ? (
            <>
              <CardTitle id="details-title" ref={detailsRef} tabIndex={-1}>
                Edit enquiry
              </CardTitle>
              <IntakeForm
                values={editFailed ? (result?.values ?? intake) : intake}
                errors={editFailed ? result?.errors : undefined}
                submitLabel="Save changes"
                pending={saving}
                intent="edit"
                onCancel={stopEditing}
              />
            </>
          ) : (
            <>
              <CardTitle id="details-title" ref={detailsRef} tabIndex={-1}>
                Details
              </CardTitle>
              <Facts>
                <div>
                  <dt>Email</dt>
                  <dd>
                    <a href={`mailto:${encodeURIComponent(intake.email).replace(/%40/g, '@')}`}>{intake.email}</a>
                  </dd>
                </div>
                <div>
                  <dt>Service</dt>
                  <dd>{SERVICE_LABEL[intake.service]}</dd>
                </div>
                <div>
                  <dt>Received</dt>
                  <dd>
                    <time dateTime={intake.createdAt}>{formatWhen(intake.createdAt)}</time>
                  </dd>
                </div>
                <div>
                  <dt>Last updated</dt>
                  <dd>
                    <time dateTime={intake.updatedAt}>{formatWhen(intake.updatedAt)}</time>
                  </dd>
                </div>
              </Facts>
              <Message>{intake.message}</Message>
              <div style={{ marginTop: 24 }}>
                <Button variant="secondary" type="button" onClick={startEditing}>
                  Edit details
                </Button>
              </div>
            </>
          )}
        </Card>

        <Card aria-labelledby="progress-title">
          <CardTitle id="progress-title">Progress</CardTitle>
          <Steps aria-label="Enquiry progress" role="list">
            {stepsFor(intake.status).map(({ value, state }, position) => (
              <Step key={value} state={state} aria-current={state === 'current' ? 'step' : undefined}>
                <i aria-hidden="true">{state === 'done' ? '✓' : position + 1}</i>
                {STATUS_LABEL[value]}
              </Step>
            ))}
            {intake.status === 'lost' && (
              <Step state="current" aria-current="step">
                <i aria-hidden="true">×</i>
                Lost
              </Step>
            )}
          </Steps>

          {intake.nextStatuses.length === 0 ? (
            <Muted>This enquiry is closed as won. Nothing more to do here.</Muted>
          ) : (
            <Moves>
              {intake.nextStatuses.map((status) => (
                <Form method="post" key={status}>
                  <input type="hidden" name="intent" value="status" />
                  <input type="hidden" name="status" value={status} />
                  <Button type="submit" variant={status === 'lost' ? 'danger' : status === 'new' ? 'secondary' : 'primary'} disabled={saving} style={{ width: '100%' }}>
                    {saving && navigation.formData?.get('status') === status ? 'Saving…' : STATUS_ACTION[status]}
                  </Button>
                </Form>
              ))}
            </Moves>
          )}
        </Card>
      </Columns>
    </>
  );
}
