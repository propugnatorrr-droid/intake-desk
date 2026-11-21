import { isRouteErrorResponse, useNavigate, useRevalidator, useRouteError } from 'react-router';
import { ApiError } from '../api/client';
import { ErrorPanel } from '../components/States';
import { Button, LinkButton } from '../components/ui';

export function RouteError() {
  const error = useRouteError();
  const revalidator = useRevalidator();
  const navigate = useNavigate();

  if (error instanceof ApiError && error.status === 404) {
    return (
      <ErrorPanel title="That enquiry is not here" message="It may have been removed, or the link is mistyped.">
        <LinkButton to="/" variant="secondary">
          Back to all enquiries
        </LinkButton>
      </ErrorPanel>
    );
  }

  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <ErrorPanel title="Page not found" message="There is nothing at this address.">
        <LinkButton to="/" variant="secondary">
          Back to all enquiries
        </LinkButton>
      </ErrorPanel>
    );
  }

  const message = error instanceof ApiError ? error.message : 'Something unexpected went wrong while loading this page.';

  return (
    <ErrorPanel title="We could not load this" message={message} onRetry={() => revalidator.revalidate()}>
      <Button variant="secondary" type="button" onClick={() => navigate('/')}>
        Go to the list
      </Button>
    </ErrorPanel>
  );
}
