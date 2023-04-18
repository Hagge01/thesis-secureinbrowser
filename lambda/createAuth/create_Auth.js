import { Context, Callback } from 'aws-lambda';
import { generateRegistrationOptions, generateAuthenticationOptions } from '@simplewebauthn/server';
import { CognitoCreateAuthEvent, Authenticator } from './local-types';

