"use client";
import React from "react";
import AppBar from "../components/layout/AppBar";
import { Button } from "../components/ui/button";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";

const LogoSVG = () => {
  return (
    <svg
      width="360"
      height="300"
      fill="none"
      viewBox="0 0 128 128"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="#f98878"
        d="m97.719 104.294-10.153 8.256-18.575-22.843 10.153-8.256 18.575 22.843zM68.164 33.032v33.685h19.103V33.032H68.164zm-9.279 0v33.685H38.736V33.032h20.149zm-9.683 49.839-1.666 2.055-15.797 19.421 8.343 6.788L57.545 89.66l-8.343-6.789z"
      />
      <path
        fill="#231f20"
        d="M126.965 50.919a5.6 5.6 0 0 0-4.012-2.348 6.706 6.706 0 0 0-5.676 2.187l-.725-.215a4.077 4.077 0 0 0-3.167.322 4.117 4.117 0 0 0-2.013 2.456l-2.59 8.602a3.302 3.302 0 0 0-.899.778L94.879 77.45l-11.93 6.549-3.61-4.442L67.1 89.515l20.277 24.921 12.225-9.944-1.791-2.205 16.378-7.014a9.731 9.731 0 0 0 5.65-6.683l7.998-33.093a5.603 5.603 0 0 0-.872-4.578zm-13.03 3.181a1.506 1.506 0 0 1 1.839-.993l.107.027c0 .013-.013.027-.013.04l-.859 2.657-1.61 5.999a6.743 6.743 0 0 0-1.664-.429l2.2-7.301zm-26.169 56.565L70.884 89.904l8.065-6.562 1.606 1.981 15.276 18.779-8.065 6.563zm37.468-55.8-7.998 33.093a7.16 7.16 0 0 1-4.093 4.858l-17.089 7.307L84.68 86.12l10.991-6.052.899-.497.295-.335.899-1.02 9.26-10.481 2.134-2.416.778-.886c.188-.228.537-.362.993-.362.51-.027 1.141.094 1.758.376.322.148.644.335.953.577.081.054.161.121.228.188.389.349.792.805 1.02 1.409.362.913.322 2.147-.832 3.704l-.242.282-2.04 2.375-2.026 2.362-3.422 4.013-1.422 1.651-.376.443-.604.711-.698.805-.98 1.154-.081.067-3.637 2.966.845 1.033.845 1.047 3.811-3.1 1.825-2.12.013-.013 6.321-7.368 3.972-4.63c2.711-3.664 1.57-6.871-.389-8.696l1.812-6.71.832-2.59c.013-.027.027-.067.04-.094.148-.443.376-.845.671-1.194a3.968 3.968 0 0 1 1.235-1.033 3.98 3.98 0 0 1 2.308-.443 2.97 2.97 0 0 1 2.107 1.221c.485.696.659 1.569.458 2.401zM48.661 79.557l-3.61 4.442-11.93-6.549-13.003-14.748a3.302 3.302 0 0 0-.899-.778l-2.59-8.602a4.12 4.12 0 0 0-2.013-2.456 4.077 4.077 0 0 0-3.167-.322l-.725.215a6.702 6.702 0 0 0-5.676-2.187 5.603 5.603 0 0 0-4.012 2.348 5.603 5.603 0 0 0-.872 4.576l7.998 33.093a9.729 9.729 0 0 0 5.65 6.683l16.385 7.019-1.798 2.201 12.225 9.944L60.9 89.515l-12.239-9.958zm-36.434-26.45a1.475 1.475 0 0 1 1.114.121c.349.188.604.497.725.872l2.201 7.3a6.787 6.787 0 0 0-1.664.429l-1.61-5.999-.859-2.657c0-.013-.013-.027-.013-.04l.106-.026zm2.63 39.709a7.16 7.16 0 0 1-4.093-4.858L2.766 54.865a2.99 2.99 0 0 1 .456-2.402 2.965 2.965 0 0 1 2.107-1.221 3.978 3.978 0 0 1 2.308.443c.47.255.899.604 1.235 1.033.295.349.523.752.671 1.194.013.027.027.067.04.094l.832 2.59 1.812 6.71c-1.959 1.825-3.1 5.032-.389 8.696l3.972 4.63L22.131 84l.013.013 1.825 2.12 3.811 3.1.845-1.047.845-1.033-3.637-2.966-.081-.067-.98-1.154-.698-.805-.604-.711-.376-.443-1.422-1.651-3.422-4.013-2.026-2.362-2.04-2.375-.242-.282c-1.154-1.557-1.194-2.791-.832-3.704.228-.604.631-1.06 1.02-1.409.067-.067.148-.134.228-.188a4.76 4.76 0 0 1 .953-.577c.617-.282 1.248-.403 1.758-.376.456 0 .805.134.993.362l.778.886 2.134 2.416 9.26 10.481.899 1.02.295.335.899.497L43.32 86.12l-11.38 13.997-17.083-7.301zm25.377 17.849-8.065-6.562L47.44 85.328l1.61-1.986 8.065 6.562-16.881 20.761zm50.761-88.254h-.001v-.001H75.067c.62-1.541.857-3.123.643-4.529-.221-1.451-.895-2.626-1.945-3.397-1.05-.776-2.375-1.065-3.827-.848-2.225.337-4.536 1.875-6.18 4.114a12.3 12.3 0 0 0-.916 1.446 12.18 12.18 0 0 0-.917-1.446c-1.65-2.241-3.962-3.78-6.184-4.115-1.448-.218-2.772.075-3.818.847-1.052.773-1.726 1.949-1.947 3.4-.215 1.406.022 2.989.642 4.529H35.004v11.966h2.386v33.681h51.215V34.376h2.388v-.001h.001V22.411zm-21.484 9.28v-6.596h3.911l.063.063.054-.063H88.31v6.596H69.511zm-3.59-12.352c1.215-1.651 2.908-2.82 4.42-3.05.51-.08 1.245-.079 1.833.356.588.431.805 1.13.882 1.639.185 1.214-.182 2.72-.963 4.124h-7.615a8.677 8.677 0 0 1 1.443-3.069zm-13.293-1.052c.079-.511.295-1.21.886-1.643.586-.432 1.313-.432 1.826-.355 1.511.228 3.207 1.398 4.424 3.052a8.632 8.632 0 0 1 1.438 3.069h-7.609c-.782-1.404-1.15-2.91-.965-4.123zm4.917 47.086h-17.47V34.376h17.47v30.997zm0-33.681H37.688v-6.599h14.456l.055.064.07-.064h5.276v6.599zm28.377 33.681h-16.41V34.376h16.41v30.997zm-19.094 0H60.23V25.094h6.593v9.281h.005v30.998z"
      />
    </svg>
  );
};

const Home = () => {
  return (
    <>
      <AppBar />
      <div className="container mx-auto px-2 lg:px-12 lg:max-w-7xl mt-20 lg:mt-24">
        <div className="lg:my-12 lg:mx-6 border py-10 lg:p-12 rounded-2xl bg-gradient-to-tl from-amber-200 via-pink-500 to-indigo-600 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            {/* Left Section with Text */}
            <div className="w-full mx-8 md:w-1/2 md:mx-20 text-left">
              <h1 className="text-3xl lg:text-6xl font-black mb-4">ZoraGift</h1>
              <p className="text-xs lg:text-lg mb-4 lg:mb-8 font-medium tracking-tight">
                Transfer Crypto as NFTs to Create Lasting Memories
              </p>
              <p className="text-xs lg:text-lg mb-4 lg:mb-8 font-medium tracking-tight">
                Using generative AI from Livepeer AI and Swarmzero.ai, ZoraGift
                helps you generate unique images for special occasions. Make
                your crypto transfers unforgettable by minting them as NFTs,
                creating a unique and lasting memory.
              </p>
              <div className="flex space-x-4">
                <Link href="/gift">
                  <Button className="px-16">Start Gifting</Button>
                </Link>
                <div className="hidden lg:flex">
                  <Link href="/gifts">
                    <Button variant="outline" className="px-16 text-black">
                      Redeem Yours
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Section with Logo */}
            <div className="w-full md:w-1/2 flex justify-center md:justify-end mt-8 md:mt-0">
              {/* Assuming you have a LogoSVG component */}
              <LogoSVG />
            </div>
          </div>
        </div>

        <div className="my-4 lg:my-10 lg:mx-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:gap-10 gap-4">
            <Card className="bg-gradient-to-br from-purple-600 to-blue-400 text-white p-4 rounded-2xl">
              <CardHeader>
                <CardTitle>Create Special Occasion NFTs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="hidden sm:block">
                  Use generative AI to craft unique images for birthdays,
                  anniversaries, and more. Combine these with crypto transfers
                  to make your gifts truly one-of-a-kind.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/gift">
                  <Button className="ml-1">Create a Gift</Button>
                </Link>
              </CardFooter>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-200 to-amber-400 p-4 rounded-2xl">
              <CardHeader>
                <CardTitle>Explore the Gift Gallery</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="hidden sm:block">
                  Discover NFT gifts created by our community. Experience the
                  unique blend of crypto transfers and AI-generated art.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/gifts">
                  <Button className="">View Gallery</Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
