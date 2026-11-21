import { createBrowserRouter, createMemoryRouter, type RouteObject } from 'react-router';
import { Layout } from './components/Layout';
import { DetailPage, detailAction, detailLoader } from './routes/DetailPage';
import { ListHydrateFallback, ListPage, listLoader } from './routes/ListPage';
import { NewPage, newAction } from './routes/NewPage';
import { RouteError } from './routes/RouteError';
import { ListSkeleton } from './components/States';

const DetailHydrateFallback = () => <ListSkeleton rows={2} />;

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    errorElement: <RouteError />,
    children: [
      {
        errorElement: <RouteError />,
        children: [
          { index: true, element: <ListPage />, loader: listLoader, HydrateFallback: ListHydrateFallback },
          { path: 'new', element: <NewPage />, action: newAction },
          { path: 'intakes/:id', element: <DetailPage />, loader: detailLoader, action: detailAction, HydrateFallback: DetailHydrateFallback },
          { path: '*', loader: () => { throw new Response('Not found', { status: 404 }); } },
        ],
      },
    ],
  },
];

export const createAppRouter = () => createBrowserRouter(routes);
export const createTestRouter = (initialEntries: string[]) => createMemoryRouter(routes, { initialEntries });
