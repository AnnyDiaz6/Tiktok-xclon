import React, { useState, useRef } from "react";
import { BsFillHeartFill } from "react-icons/bs";
import { AiFillMessage } from "react-icons/ai";
import { Spin } from "react-cssfx-loading";
import useStore from "../../stored/app";
import { trpc } from "../../utils/trpc";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import Link from "next/link";
import Controls from "../Controls";

interface VideoPlayerProps {
  videoUrl: string;
  width: number;
  height: number;
  videoId: string;
  like: boolean;
  likeCount: number;
  commentCount: number;
  id: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  width,
  height,
  videoId,
  like,
  likeCount,
  id,
  commentCount,
}) => {
  const [loading, setLoading] = useState(false);
  const [isLike, setIslike] = useState(like);
  const [likes, setLikes] = useState(likeCount);

  const { isSound, setSound } = useStore();

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const { mutateAsync } = trpc.like.likeVideo.useMutation({
    onError: () => {
      toast.error("Something went wrong!");
      setIslike((prev) => !prev);
    },
  });

  const { data } = useSession();

  const handleLike = () => {
    if (!data?.user) {
      toast.error("You need to login!");
      return;
    }
    setIslike((prev) => !prev);
    if (isLike) {
      setLikes((prev) => prev - 1);
    } else {
      setLikes((prev) => prev + 1);
    }
    mutateAsync({ videoId: videoId });
  };

  return (
    <div className="relative flex items-end">
      <Link
        href={`/video/${id}`}
        className={`mt-3 ${
          height > width * 1.3
            ? "aspect-[9/16] w-[200px] md:w-[289px]"
            : "aspect-auto md:flex-1"
        } relative max-w-full overflow-hidden rounded-md bg-[#222]`}
      >
        <video
          loop
          onCanPlay={() => setLoading(false)}
          onWaiting={() => setLoading(true)}
          ref={videoRef}
          className="h-full w-full rounded-md"
          src={videoUrl}
        />

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Spin />
          </div>
        )}

        <Controls isSoundOn={isSound} setSound={setSound} videoRef={videoRef} />
      </Link>

      <div className="ml-2 pr-2 md:ml-5">
        <div className="mb-2 flex flex-col items-center">
          <div
            onClick={handleLike}
            className="flex h-[40px] w-[40px] cursor-pointer items-center justify-center rounded-full bg-[#2f2f2f] md:h-12 md:w-12"
          >
            <BsFillHeartFill
              className={`${
                isLike ? "text-primary" : "text-white"
              } text-[18px] md:text-[21px]`}
            />
          </div>
          <p className="mt-2 text-[12px] font-normal text-[#fffffb]">{likes}</p>
        </div>
        <Link href={`/video/${videoId}`}>
          <div className="flex flex-col items-center">
            <div className="flex h-[40px] w-[40px] cursor-pointer items-center justify-center rounded-full bg-[#2f2f2f] md:h-12 md:w-12">
              <AiFillMessage
                className="text-[18px] md:text-[21px]"
                color="#fff"
              />
            </div>
            <p className="mt-2 text-[12px] font-normal text-[#fffffb]">
              {commentCount}
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default VideoPlayer;
