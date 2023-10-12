import { useUser } from "@clerk/nextjs";
import Head from "next/head";
import { type NextPage } from "next";

const SinglePagePost: NextPage = () => {
  return (
    <>
      <Head>
        <title>Post</title>
      </Head>
      <main className="flex h-screen justify-center">
        <div>Post View</div>
      </main>
    </>
  );
};

export default SinglePagePost;
