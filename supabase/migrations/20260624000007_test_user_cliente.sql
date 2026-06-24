-- Usuario de prueba: cliente@test.com / Test1234!
-- El trigger handle_new_user crea el profile con role = 'client' automáticamente.
create extension if not exists pgcrypto with schema extensions;

do $$
begin
  if not exists (select 1 from auth.users where email = 'cliente@test.com') then
    insert into auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      aud,
      role,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) values (
      gen_random_uuid(),
      '00000000-0000-0000-0000-000000000000',
      'cliente@test.com',
      extensions.crypt('Test1234!', extensions.gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Cliente Test"}'::jsonb,
      'authenticated',
      'authenticated',
      '', '', '', ''
    );
  end if;
end $$;
