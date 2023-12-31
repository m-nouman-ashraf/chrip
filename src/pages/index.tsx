import { SignIn, SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { Sign } from "crypto";
import Head from "next/head";
import Link from "next/link";
import { number } from "zod";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { type RouterOutputs, api } from "~/utils/api";
import Image from "next/image";
import { LoadingPage, LoadingSpiner } from "~/components/Loader";
import { type NextPage } from "next";
import { useState } from "react";
import toast from "react-hot-toast";
import { PageLayout } from "~/components/layout";

dayjs.extend(relativeTime);
const CreatePostWizard = () => {
  const [inputValue, setInputValue] = useState("");
  const { user } = useUser();

  const ctx = api.useContext();
  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInputValue("");
      void ctx.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage?.[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Faild To Post! Please try again later");
      }

      setInputValue("");
    },
  });
  if (!user) return null;

  return (
    <div className="flex w-full gap-3">
      <Image
        src={user.imageUrl}
        alt="profile"
        className="rounded-full"
        height={56}
        width={56}
      />
      <input
        placeholder="Type some emojis"
        className="grow bg-transparent outline-none"
        type="text"
        disabled={isPosting}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      {inputValue !== "" && !isPosting && (
        <button
          onClick={() => mutate({ content: inputValue })}
          disabled={isPosting}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (inputValue !== "") {
                mutate({ content: inputValue });
              }
            }
          }}
        >
          Post
        </button>
      )}
      {isPosting && (
        <div className="flex items-center justify-center">
          <LoadingSpiner size={20} />
        </div>
      )}
    </div>
  );
};

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

const PostView = (props: PostWithUser) => {
  const { author, post } = props;
  return (
    <div key={post.id} className="flex gap-3 border-b border-slate-400 p-4">
      <Image
        src={author.profileImageUrl}
        alt={`@${author.username} profils pic`}
        className="rounded-full"
        height={56}
        width={56}
      />
      <div className="flex flex-col">
        <div className="flex gap-1 font-bold text-slate-300">
          <div className="flex gap-1 font-bold text-slate-300">
            <Link href={`/@${author.username}`}>
              <span>{`@${author.username}`}</span>
            </Link>
          </div>
          <Link href={`/post/${post.id}`}>
            <span className="font-thin">{`- ${dayjs(
              post.createdAt,
            ).fromNow()}`}</span>
          </Link>
        </div>

        <span className="text-2xl">{post.content}</span>
      </div>
    </div>
  );
};

const Feed = () => {
  const { data, isLoading: postLoading } = api.posts.getAll.useQuery();

  if (postLoading) return <LoadingPage />;

  if (!data) return <div>Some thing went wrong....</div>;
  return (
    <div className="flex flex-col">
      {data?.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

const Home: NextPage = () => {
  const { isLoaded: userLoaded, isSignedIn } = useUser();
  api.posts.getAll.useQuery();

  if (!userLoaded) return <div />;
  return (
    <PageLayout>
      <div className="flex border-b border-slate-400 p-4">
        {!isSignedIn && (
          <div className="flex justify-center">
            <SignInButton />
          </div>
        )}
        {isSignedIn && <CreatePostWizard />}
        <SignIn />
      </div>
      <div className="flex flex-col">{<Feed />}</div>
    </PageLayout>
  );
};

export default Home;
