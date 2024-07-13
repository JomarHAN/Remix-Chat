import { json, type LoaderFunction } from "@remix-run/node";
import { authenticate } from "~/shopify.server";

export const loader: LoaderFunction = async ({ request }) => {
  const { session, admin } = await authenticate.admin(request);

  try {
    const response = await admin.rest.resources.InventoryLevel.all({
      session: session,
      location_ids: "74315399489",
    });

    if (response) {
      const data = response.data;
      return json(data);
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch inventory");
  }
};

const Inventory = () => {
  return <div>Inventory</div>;
};

export default Inventory;
