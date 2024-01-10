import { serverSupabaseServiceRole } from '#supabase/server';
import type { Database } from '~/types/database.types';

interface SignUpRequest {
  fullName: string;
  email: string;
  password: string;
  username: string;
  joincode: string;
}

export default defineEventHandler(async (event) => {
  const client = serverSupabaseServiceRole<Database>(event);

  const body: SignUpRequest = await readBody(event);

  // Confirm the joincode before proceeding

  if (!confirmJoincode(body.joincode)) {
    throw createError({
      status: 401,
      statusMessage: 'unauthorized',
    });
  }

  // Continue with sign up

  const { error } = await client.auth.admin.createUser({
    email: body.email,
    email_confirm: true,
    password: body.password,
  });

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }

  // Add profile
  const { error: addProfileError } = await client.from('profiles').insert({
    full_name: body.fullName,
    username: body.fullName,
  });

  if (addProfileError) {
    throw createError({
      statusCode: 500,
      statusMessage: addProfileError.message,
    });
  }

  return {
    statusCode: 200,
    statusMessage: 'OK',
  };
});

function confirmJoincode(client_joincode: string): boolean {
  const SERVER_JOINCODE = process.env.SIGNUP_JOIN_CODE;

  console.log('Server code: ', SERVER_JOINCODE);

  if (client_joincode === SERVER_JOINCODE) {
    return true;
  }

  return false;
}
