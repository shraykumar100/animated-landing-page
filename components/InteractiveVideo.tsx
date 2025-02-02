"use client";
import throttle from "lodash.throttle";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const InteractiveVideo: React.FC = () => {
	const [currentFrame, setCurrentFrame] = useState<number>(1); // Start with the first frame
	const totalFrames = 1400; // Total number of frames (adjust as needed)
	const containerRef = useRef<HTMLDivElement | null>(null);
	const imageCache = useRef<Map<number, HTMLImageElement>>(new Map()); // Cache for preloaded images

	// Preload all frames into the cache
	useEffect(() => {
		const preloadAllImages = async () => {
			for (let i = 1; i <= totalFrames; i++) {
				const img = new Image();
				img.src = `/images/Airdrop Page 2_${String(i).padStart(5, "0")}.jpg`;
				await new Promise((resolve) => {
					img.onload = resolve;
				});
				imageCache.current.set(i, img); // Store the preloaded image in the cache
			}
		};

		preloadAllImages();
	}, []);

	// Handle scroll event
	const throttledHandleScroll = throttle((event: WheelEvent) => {
		const delta = event.deltaY;

		if (delta > 0 && currentFrame < totalFrames) {
			setCurrentFrame((prev) => prev + 1); // Move to the next frame
		} else if (delta < 0 && currentFrame > 1) {
			setCurrentFrame((prev) => prev - 1); // Move to the previous frame
		}
	}, 50); // Adjust throttle delay as needed

	// Attach scroll listener when the component mounts
	useEffect(() => {
		const container = containerRef.current;
		if (container) {
			container.addEventListener("wheel", throttledHandleScroll);
		}

		return () => {
			if (container) {
				container.removeEventListener("wheel", throttledHandleScroll);
			}
		};
	}, [currentFrame]);

	// Keyboard navigation
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "ArrowDown" && currentFrame < totalFrames) {
				setCurrentFrame((prev) => prev + 1);
			} else if (event.key === "ArrowUp" && currentFrame > 1) {
				setCurrentFrame((prev) => prev - 1);
			}
		};

		window.addEventListener("keydown", handleKeyDown);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [currentFrame]);

	// Get the current and next frame images from the cache
	const currentImage = imageCache.current.get(currentFrame);
	const nextImage = imageCache.current.get(currentFrame + 1);

	// Use GSAP for smooth transitions
	useEffect(() => {
		const currentImg = document.getElementById(`frame-${currentFrame}`);
		const nextImg = document.getElementById(`frame-${currentFrame + 1}`);

		if (currentImg && nextImg) {
			// Fade out the current frame
			gsap.to(currentImg, {
				opacity: 0,
				duration: 0.3,
				ease: "power2.inOut",
			});

			// Fade in the next frame
			gsap.to(nextImg, {
				opacity: 1,
				duration: 0.3,
				ease: "power2.inOut",
			});
		}
	}, [currentFrame]);

	return (
		<div ref={containerRef} className="w-screen h-screen flex justify-center items-center overflow-hidden bg-black">
			{/* Current Frame */}
			<img
				id={`frame-${currentFrame}`}
				src={currentImage?.src || ""}
				alt={`Frame ${currentFrame}`}
				className="absolute w-full h-full object-contain"
				style={{ opacity: 1 }}
			/>

			{/* Next Frame (pre-rendered) */}
			{nextImage && (
				<img
					id={`frame-${currentFrame + 1}`}
					src={nextImage.src}
					alt={`Frame ${currentFrame + 1}`}
					className="absolute w-full h-full object-contain"
					style={{ opacity: 0 }}
				/>
			)}
		</div>
	);
};

export default InteractiveVideo;
