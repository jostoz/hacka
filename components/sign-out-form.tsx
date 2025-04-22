import { signOut } from 'next-auth/react';

export const SignOutForm = () => {
  return (
    <form
      className="w-full"
      action={async () => {
        'use server';
        await signOut({ redirectTo: '/' });
      }}
    >
      <button
        type="submit"
        className="w-full text-left px-1 py-0.5 text-red-500 hover:bg-red-50 transition-colors"
      >
        Sign out
      </button>
    </form>
  );
};
