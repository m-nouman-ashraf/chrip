import { User } from "@clerk/nextjs/dist/types/api";
export const filterUserFromClient = (user: User) => {
  return {
    id: user.id,
    username: user.username,
    imageUrl: user.imageUrl,
  };
};
