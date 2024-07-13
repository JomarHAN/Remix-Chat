import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Card, Layout, List, Page } from "@shopify/polaris";
import { authenticate } from "~/shopify.server";

const query = `
    {
        products(first: 10) {
            edges {
                node {
                    id
                    title
                    handle
                    description
                }
            }
            pageInfo {
                hasNextPage
            }
        }
    }
`;

export const loader: LoaderFunction = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const { shop, accessToken } = session;

  try {
    const response = await fetch(
      `https://${shop}/admin/api/2023-10/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/graphql",
          "X-Shopify-Access-Token": accessToken!,
        },
        body: query,
      },
    );

    if (response.ok) {
      const { data } = await response.json();
      const {
        products: { edges },
      } = data;

      return edges;
    }
    return null;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch products");
  }
};

const Products = () => {
  const products: any = useLoaderData();

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <Card>
            <h1>Products</h1>
          </Card>
        </Layout.Section>
        <Layout.Section>
          <Card>
            <List type="bullet" gap="loose">
              {products.map((edge: any) => {
                const product = edge.node;
                return (
                  <List.Item key={product.id}>
                    <h1>{product.title}</h1>
                    <p>{product.description}</p>
                  </List.Item>
                );
              })}
            </List>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default Products;
