import type { ActionFunction } from "@remix-run/node";
import { Form, json, useSubmit } from "@remix-run/react";
import {
  Button,
  Card,
  InlineGrid,
  Layout,
  Page,
  TextField,
} from "@shopify/polaris";
import { useState } from "react";
import { createUser } from "~/api/prisma.server";
import { authenticate } from "~/shopify.server";

export const action: ActionFunction = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const firstName = formData.get("firstname");
  const lastName = formData.get("lastname");
  const email = formData.get("email");
  const phone = formData.get("phone");

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
            firstName: firstName,
            lastName: lastName,
            addresses: [
              {
                address1: "905 BRICKELL BAY DR",
                city: "Miami",
                province: "FL",
                phone: phone,
                zip: "33131",
                lastName: lastName,
                firstName: firstName,
                country: "USA",
              },
            ],
          },
        },
      },
    );

    if (response.ok) {
      const {
        data: { data },
      } = await response.json();
      await createUser({
        id: 1,
        email: email,
        firstName: firstName,
        lastName: lastName,
        phone: phone,
      });
      return json({ data });
    }

    return null;
  } catch (error: any) {
    console.error(error.message);
    throw new Error(`${error.message}`);
  }

  return null;
};

const Customer = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
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
                <InlineGrid columns={2} gap={"400"}>
                  <TextField
                    autoComplete=""
                    type="text"
                    label="First Name"
                    name="firstname"
                    value={firstName}
                    onChange={(value) => setFirstName(value)}
                  />
                  <TextField
                    autoComplete=""
                    type="text"
                    label="Last Name"
                    name="lastname"
                    value={lastName}
                    onChange={(value) => setLastName(value)}
                  />
                </InlineGrid>
                <InlineGrid columns={2} gap={"400"}>
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
