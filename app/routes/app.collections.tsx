import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Card, Layout, List, Page } from "@shopify/polaris";
import { authenticate } from "~/shopify.server";

export const query = `
    {
        collections(first: 10) {
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
      const data = await response.json();
      const {
        data: {
          collections: { edges },
        },
      } = data;
      return edges;
    }
    return null;
  } catch (err) {
    console.log(err);
    throw new Error("Failed to fetch collections");
  }
};

const Collections = () => {
  const collections: any = useLoaderData();

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <Card>
            <h1>Collections</h1>
          </Card>
        </Layout.Section>
        <Layout.Section>
          <Card>
            <List type="bullet">
              {collections.map((edge: any) => {
                const { node: collection } = edge;
                return (
                  <List.Item key={collection.id}>
                    <h2>{collection.title}</h2>
                    <h2>{collection.description}</h2>
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

export default Collections;
