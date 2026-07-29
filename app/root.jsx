import {Outlet, useRouteLoaderData} from 'react-router';
import {BilditRoot, getBannersForRequest} from '@bildit-platform/hydrogen';

export async function loader({request, context}) {
  const banners = await getBannersForRequest(request, context.env);

  return {
    banners,
  };
}

export default function App() {
  const data = useRouteLoaderData('root');
  const banners = data?.banners ?? [];

  return (
    <BilditRoot banners={banners}>
      <Outlet />
    </BilditRoot>
  );
}
