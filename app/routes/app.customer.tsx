import type { ActionFunction } from "@remix-run/node";
import { Form, json, useActionData, useSubmit } from "@remix-run/react";
import {
  Button,
  Card,
  InlineGrid,
  Layout,
  Page,
  TextField,
} from "@shopify/polaris";
import React, { useState } from "react";
import { createUser } from "~/api/prisma.server";
import { authenticate } from "~/shopify.server";

export const action: ActionFunction = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const dataObject = Object.fromEntries(formData);
  const fullName = dataObject.fullname.toString();
  const phone = dataObject.phone.toString();
  const email = dataObject.email.toString();

  try {
    const response = await admin.graphql(
      `
      #graphql
      mutation customerCreate($input: CustomerInput!) {
      customerCreate(input: $input) {
        userErrors {
          field
          message
        }
        customer {
          id
          email
          phone
          taxExempt
          firstName
          lastName
          smsMarketingConsent {
            marketingState
            marketingOptInLevel
          }
          addresses {
            address1
            city
            country
            phone
            zip
          }
        }
      }
    }`,
      {
        variables: {
          input: {
            email: email,
            phone: phone,
            firstName: fullName,
            lastName: "Lastname",
            addresses: [
              {
                address1: "412 fake st",
                city: "Ottawa",
                phone: "+16469999999",
                zip: "A1A 4A1",
                lastName: "Lastname",
                firstName: "Steve",
              },
            ],
          },
        },
      },
    );

    if (response.ok) {
      await createUser({
        id: "3",
        email: email,
        fullName: fullName,
        phone: phone,
      });
      return json(response);
    }

    return null;
  } catch (error: any) {
    console.error(error.message);
    throw new Error(`${error.message}`);
  }

  return null;
};

const Customer = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const submit = useSubmit();

  return (
    <Page title="Customer page">
      <Layout>
        <Layout.Section>
          <Card>
            <Form method="post" onSubmit={() => submit}>
              <Layout.Section>
                <InlineGrid columns={3} gap={"400"}>
                  <TextField
                    autoComplete=""
                    type="text"
                    label="Full Name"
                    name="fullname"
                    value={fullName}
                    onChange={(value) => setFullName(value)}
                  />
                  <TextField
                    autoComplete=""
                    type="email"
                    label="Email"
                    name="email"
                    value={email}
                    onChange={(value) => setEmail(value)}
                  />
                  <TextField
                    autoComplete=""
                    type="tel"
                    label="Phone"
                    name="phone"
                    maxLength={12}
                    value={phone}
                    onChange={(value) => setPhone(value)}
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

export default Customer;
