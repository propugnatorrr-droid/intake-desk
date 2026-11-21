import styled from '@emotion/styled';
import { useEffect, useRef } from 'react';
import { Form } from 'react-router';
import { SERVICES, SERVICE_LABEL } from '../lib/labels';
import { bp, color, radius, space } from '../theme';
import type { FieldErrors, IntakeFields } from '../types';
import { Button } from './ui';

const FormGrid = styled(Form)`
  display: grid;
  gap: ${space(2.5)};
`;

const Row = styled.div`
  display: grid;
  gap: ${space(2.5)};

  @media (min-width: ${bp.tablet}) {
    grid-template-columns: 1fr 1fr;
  }
`;

const FieldWrap = styled.div`
  display: grid;
  gap: 6px;

  label {
    font-weight: 700;
    font-size: 0.92rem;
  }
  small {
    color: ${color.muted};
  }
`;

const controlStyles = (invalid: boolean) => `
  width: 100%;
  min-height: 44px;
  padding: 10px 14px;
  border-radius: ${radius.md};
  border: 1.5px solid ${invalid ? color.danger : color.lineStrong};
  background: ${color.surface};
  font-size: 1rem;
`;

const Input = styled.input<{ invalid: boolean }>`
  ${({ invalid }) => controlStyles(invalid)}
`;
const Select = styled.select<{ invalid: boolean }>`
  ${({ invalid }) => controlStyles(invalid)}
`;
const Textarea = styled.textarea<{ invalid: boolean }>`
  ${({ invalid }) => controlStyles(invalid)}
  min-height: 140px;
  resize: vertical;
`;

const FieldError = styled.p`
  color: ${color.danger};
  font-weight: 600;
  font-size: 0.9rem;
`;

const Summary = styled.div`
  border: 1.5px solid ${color.danger};
  background: ${color.dangerSoft};
  border-radius: ${radius.md};
  padding: ${space(2)} ${space(2.5)};
  outline: none;

  h2 {
    font-size: 1.05rem;
    margin-bottom: ${space(1)};
  }
  ul {
    margin: 0;
    padding-left: ${space(2.5)};
  }
  a {
    color: ${color.danger};
    font-weight: 600;
  }
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${space(1.5)};
`;

const FIELD_LABEL: Record<keyof IntakeFields, string> = {
  clientName: 'Client name',
  email: 'Email',
  company: 'Company',
  service: 'Service needed',
  message: 'What the client needs',
};

interface Props {
  values: IntakeFields;
  errors: FieldErrors | undefined;
  submitLabel: string;
  pending: boolean;
  intent?: string;
  onCancel?: () => void;
}

export function IntakeForm({ values, errors, submitLabel, pending, intent, onCancel }: Props) {
  const summaryRef = useRef<HTMLDivElement>(null);
  const messages = errors ? (Object.entries(errors) as [keyof FieldErrors, string][]) : [];
  const hasErrors = messages.length > 0;

  // After a failed submit, move focus to the summary so the problem is announced and reachable.
  useEffect(() => {
    if (hasErrors) summaryRef.current?.focus();
  }, [errors, hasErrors]);

  const describe = (field: keyof IntakeFields) => (errors?.[field] ? `${field}-error` : undefined);

  return (
    <FormGrid method="post" noValidate>
      {intent && <input type="hidden" name="intent" value={intent} />}

      {hasErrors && (
        <Summary ref={summaryRef} tabIndex={-1} role="alert" aria-labelledby="error-summary-title">
          <h2 id="error-summary-title">There {messages.length === 1 ? 'is 1 problem' : `are ${messages.length} problems`} to fix</h2>
          <ul>
            {messages.map(([field, message]) => (
              <li key={field}>
                {field in FIELD_LABEL ? <a href={`#${field}`}>{message}</a> : message}
              </li>
            ))}
          </ul>
        </Summary>
      )}

      <Row>
        <FieldWrap>
          <label htmlFor="clientName">{FIELD_LABEL.clientName}</label>
          <Input id="clientName" name="clientName" defaultValue={values.clientName} autoComplete="name" required maxLength={120}
            invalid={Boolean(errors?.clientName)} aria-invalid={Boolean(errors?.clientName)} aria-describedby={describe('clientName')} />
          {errors?.clientName && <FieldError id="clientName-error">{errors.clientName}</FieldError>}
        </FieldWrap>
        <FieldWrap>
          <label htmlFor="email">{FIELD_LABEL.email}</label>
          <Input id="email" name="email" type="email" defaultValue={values.email} autoComplete="email" required maxLength={254}
            invalid={Boolean(errors?.email)} aria-invalid={Boolean(errors?.email)} aria-describedby={describe('email')} />
          {errors?.email && <FieldError id="email-error">{errors.email}</FieldError>}
        </FieldWrap>
      </Row>

      <Row>
        <FieldWrap>
          <label htmlFor="company">
            {FIELD_LABEL.company} <small>(optional)</small>
          </label>
          <Input id="company" name="company" defaultValue={values.company} autoComplete="organization" maxLength={120}
            invalid={Boolean(errors?.company)} aria-invalid={Boolean(errors?.company)} aria-describedby={describe('company')} />
          {errors?.company && <FieldError id="company-error">{errors.company}</FieldError>}
        </FieldWrap>
        <FieldWrap>
          <label htmlFor="service">{FIELD_LABEL.service}</label>
          <Select id="service" name="service" defaultValue={values.service} required
            invalid={Boolean(errors?.service)} aria-invalid={Boolean(errors?.service)} aria-describedby={describe('service')}>
            <option value="" disabled>
              Choose a service
            </option>
            {SERVICES.map((service) => (
              <option key={service} value={service}>
                {SERVICE_LABEL[service]}
              </option>
            ))}
          </Select>
          {errors?.service && <FieldError id="service-error">{errors.service}</FieldError>}
        </FieldWrap>
      </Row>

      <FieldWrap>
        <label htmlFor="message">{FIELD_LABEL.message}</label>
        <Textarea id="message" name="message" defaultValue={values.message} required maxLength={2000}
          invalid={Boolean(errors?.message)} aria-invalid={Boolean(errors?.message)} aria-describedby={describe('message')} />
        {errors?.message ? <FieldError id="message-error">{errors.message}</FieldError> : <small>A few lines is plenty. Up to 2000 characters.</small>}
      </FieldWrap>

      <Actions>
        <Button type="submit" disabled={pending}>
          {pending ? 'Saving…' : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={pending}>
            Cancel
          </Button>
        )}
      </Actions>
    </FormGrid>
  );
}
