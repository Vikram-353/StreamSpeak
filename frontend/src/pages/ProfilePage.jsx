import React from "react";
import useAuthHook from "../hooks/useAuthHook";

function ProfilePage() {
  const { authUser } = useAuthHook();
  console.log(authUser);

  return <div>{authUser.fullname}</div>;
}

export default ProfilePage;
