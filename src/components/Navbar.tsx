import { useUser, SignInButton, SignOutButton } from "@clerk/clerk-react";

export default function UserWidget() {
  const { isSignedIn, user } = useUser();

  if (!isSignedIn) return <SignInButton />;

  return (
    <div
      style={{
        position: "absolute",
        top: 10,
        right: 10,
        display: "flex",
        alignItems: "center",
        gap: 6,
        background: "rgba(255,255,255,0.9)",
        padding: "4px 8px",
        borderRadius: 6,
        boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
        zIndex: 1000,
      }}
    >
      <span>{user.firstName} {user.lastName}</span>
      <SignOutButton />
    </div>
  );
}
