import { redirect, useActionData, useNavigate, useNavigation, type ActionFunctionArgs } from 'react-router';
import { ApiError, createIntake } from '../api/client';
import { IntakeForm } from '../components/IntakeForm';
import { Card, Eyebrow, Muted, PageTitle } from '../components/ui';
import { useTitle } from '../lib/useTitle';
import type { FieldErrors, IntakeFields } from '../types';

interface ActionResult {
  errors: FieldErrors;
  values: IntakeFields;
}

export function readFields(form: FormData): IntakeFields {
  const get = (key: keyof IntakeFields) => String(form.get(key) ?? '');
  return {
    clientName: get('clientName'),
    email: get('email'),
    company: get('company'),
    service: get('service'),
    message: get('message'),
  };
}

export async function newAction({ request }: ActionFunctionArgs): Promise<Response | ActionResult> {
  const values = readFields(await request.formData());

  try {
    const created = await createIntake(values);
    return redirect(`/intakes/${created.id}`);
  } catch (error) {
    if (error instanceof ApiError) {
      const hasFieldErrors = Object.keys(error.fields).length > 0;
      return { values, errors: hasFieldErrors ? error.fields : { _: error.message } };
    }
    throw error;
  }
}

const EMPTY: IntakeFields = { clientName: '', email: '', company: '', service: '', message: '' };

export function NewPage() {
  const result = useActionData() as ActionResult | undefined;
  const navigation = useNavigation();
  const navigate = useNavigate();

  useTitle('New enquiry');

  return (
    <>
      <Eyebrow>Client intake</Eyebrow>
      <PageTitle>Log a new enquiry</PageTitle>
      <Muted style={{ margin: '8px 0 24px' }}>Capture it while it is fresh. You can change anything later.</Muted>
      <Card>
        <IntakeForm
          values={result?.values ?? EMPTY}
          errors={result?.errors}
          submitLabel="Save enquiry"
          pending={navigation.state === 'submitting'}
          onCancel={() => navigate('/')}
        />
      </Card>
    </>
  );
}
