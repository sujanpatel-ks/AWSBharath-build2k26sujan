/**
 * AgroCare AI — AWS Amplify v6 configuration
 * Values are injected from environment variables at build time.
 * No credentials are hard-coded.
 */

import { Amplify } from "aws-amplify";

export function configureAmplify(): void {
  const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID as string;
  const userPoolClientId = import.meta.env.VITE_COGNITO_APP_CLIENT_ID as string;
  const region = import.meta.env.VITE_AWS_REGION as string;

  if (!userPoolId || !userPoolClientId || !region) {
    console.warn(
      "Cognito environment variables not set. Auth will not work.\n" +
      "Required: VITE_COGNITO_USER_POOL_ID, VITE_COGNITO_APP_CLIENT_ID, VITE_AWS_REGION"
    );
  }

  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId,
        userPoolClientId,
        loginWith: {
          email: true,
        },
        signUpVerificationMethod: "code",
        userAttributes: {
          email: { required: true },
          name: { required: true },
        },
        passwordFormat: {
          minLength: 8,
          requireLowercase: true,
          requireNumbers: true,
          requireUppercase: false,
          requireSpecialCharacters: false,
        },
      },
    },
  });
}
