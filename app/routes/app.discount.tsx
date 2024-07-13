import { type ActionFunction, json } from "@remix-run/node";
import { Form, useSubmit } from "@remix-run/react";
import {
  Button,
  Card,
  InlineGrid,
  Layout,
  Page,
  TextField,
} from "@shopify/polaris";
import React, { useState } from "react";
import { authenticate } from "~/shopify.server";

export const action: ActionFunction = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const { discountTitle, discountCode, discountAmount, minAmount, endDate } =
    Object.fromEntries(formData);

  try {
    const response = await admin.graphql(
      `#graphql
    
    mutation discountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
    discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
      codeDiscountNode {
        codeDiscount {
          ... on DiscountCodeBasic {
            title
            minimumRequirement{
              ... on DiscountMinimumSubtotal{
                greaterThanOrEqualToSubtotal{
                  amount
                }
              }
            }
            codes(first: 10) {
              nodes {
                code
              }
            }
            startsAt
            endsAt
            customerSelection {
              ... on DiscountCustomerAll {
                allCustomers
              }
            }
            customerGets {
              value {
                ... on DiscountAmount{
                  amount {
                    amount
                    currencyCode
                  }
                }
              }
              items {
                ... on AllDiscountItems {
                  allItems
                }
              }
            }
            appliesOncePerCustomer
          }
        }
      }
      userErrors {
        field
        code
        message
      }
    }
  }
`,
      {
        variables: {
          basicCodeDiscount: {
            title: discountTitle,
            code: discountCode,
            startsAt: new Date().toISOString(),
            endsAt: endDate,
            customerSelection: {
              all: true,
            },
            minimumRequirement: {
              subtotal: {
                greaterThanOrEqualToSubtotal: minAmount,
              },
            },
            customerGets: {
              value: {
                discountAmount: {
                  amount: discountAmount,
                  appliesOnEachItem: false,
                },
              },
              items: {
                all: true,
              },
            },
            appliesOncePerCustomer: true,
          },
        },
      },
    );

    const data = await response.json();

    return json(data);
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create discount");
  }
  return null;
};

const Discount = () => {
  const [discountCode, setDiscountCode] = useState("");
  const [discountTitle, setDiscountTitle] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [minAmount, setMinAmount] = useState(0);
  const [endDate, setEndDate] = useState("");
  const submit = useSubmit();

  const handleSubmit = () => submit({}, { replace: true, method: "post" });
  return (
    <Page title="Discount">
      <Layout>
        <Layout.Section>
          <Card>
            <Form method="post" onSubmit={handleSubmit}>
              <Layout.Section>
                <TextField
                  autoComplete=""
                  label="Discount title"
                  name="discountTitle"
                  type="text"
                  value={discountTitle}
                  onChange={(value) => setDiscountTitle(value)}
                />
              </Layout.Section>
              <Layout.Section>
                <InlineGrid columns={2} gap={"400"}>
                  <TextField
                    autoComplete=""
                    label="Discount code"
                    name="discountCode"
                    type="text"
                    value={discountCode}
                    onChange={(value) => setDiscountCode(value)}
                  />
                  <TextField
                    autoComplete=""
                    label="Discount amount"
                    name="discountAmount"
                    type="number"
                    value={discountAmount.toString()}
                    onChange={(value) => setDiscountAmount(Number(value))}
                  />
                </InlineGrid>
              </Layout.Section>
              <Layout.Section>
                <InlineGrid columns={2} gap={"400"}>
                  <TextField
                    autoComplete=""
                    label="Min Order Amount"
                    name="minAmount"
                    type="number"
                    value={minAmount.toString()}
                    onChange={(value) => setMinAmount(Number(value))}
                  />
                  <TextField
                    autoComplete=""
                    label="End date"
                    name="endDate"
                    type="date"
                    value={endDate}
                    onChange={(value) => setEndDate(value)}
                  />
                </InlineGrid>
              </Layout.Section>
              <Layout.Section>
                <Button variant="primary" submit>
                  Submit
                </Button>
              </Layout.Section>
            </Form>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default Discount;
