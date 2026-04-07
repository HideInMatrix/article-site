"use client";

import { useEffect, useRef, useState } from "react";

type XY = { x: number; y: number };
type CharacterPose = { faceX: number; faceY: number; bodySkew: number };

type PupilProps = {
  size?: number;
  maxDistance?: number;
  pupilColor?: string;
  forceLookX?: number;
  forceLookY?: number;
};

function Pupil({
  size = 12,
  maxDistance = 5,
  pupilColor = "#111827",
  forceLookX,
  forceLookY,
}: PupilProps) {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [position, setPosition] = useState<XY>({ x: 0, y: 0 });
  const pupilRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMouseX(event.clientX);
      setMouseY(event.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    if (forceLookX !== undefined && forceLookY !== undefined) {
      return;
    }

    if (!pupilRef.current) return;

    const rect = pupilRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = mouseX - centerX;
    const deltaY = mouseY - centerY;
    const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);
    const angle = Math.atan2(deltaY, deltaX);

    setPosition({
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
    });
  }, [forceLookX, forceLookY, maxDistance, mouseX, mouseY]);

  const renderedPosition =
    forceLookX !== undefined && forceLookY !== undefined
      ? { x: forceLookX, y: forceLookY }
      : position;

  return (
    <div
      ref={pupilRef}
      className="rounded-full"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: pupilColor,
        transform: `translate(${renderedPosition.x}px, ${renderedPosition.y}px)`,
        transition: "transform 0.1s ease-out",
      }}
    />
  );
}

type EyeBallProps = {
  size?: number;
  pupilSize?: number;
  maxDistance?: number;
  eyeColor?: string;
  pupilColor?: string;
  isBlinking?: boolean;
  forceLookX?: number;
  forceLookY?: number;
};

function EyeBall({
  size = 48,
  pupilSize = 16,
  maxDistance = 10,
  eyeColor = "white",
  pupilColor = "#111827",
  isBlinking = false,
  forceLookX,
  forceLookY,
}: EyeBallProps) {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [position, setPosition] = useState<XY>({ x: 0, y: 0 });
  const eyeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMouseX(event.clientX);
      setMouseY(event.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    if (forceLookX !== undefined && forceLookY !== undefined) {
      return;
    }

    if (!eyeRef.current) return;

    const rect = eyeRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = mouseX - centerX;
    const deltaY = mouseY - centerY;
    const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);
    const angle = Math.atan2(deltaY, deltaX);

    setPosition({
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
    });
  }, [forceLookX, forceLookY, maxDistance, mouseX, mouseY]);

  const renderedPosition =
    forceLookX !== undefined && forceLookY !== undefined
      ? { x: forceLookX, y: forceLookY }
      : position;

  return (
    <div
      ref={eyeRef}
      className="flex items-center justify-center overflow-hidden rounded-full transition-all duration-150"
      style={{
        width: `${size}px`,
        height: isBlinking ? "2px" : `${size}px`,
        backgroundColor: eyeColor,
      }}
    >
      {!isBlinking ? (
        <div
          className="rounded-full"
          style={{
            width: `${pupilSize}px`,
            height: `${pupilSize}px`,
            backgroundColor: pupilColor,
            transform: `translate(${renderedPosition.x}px, ${renderedPosition.y}px)`,
            transition: "transform 0.1s ease-out",
          }}
        />
      ) : null}
    </div>
  );
}

type AnimatedCharactersProps = {
  isTyping?: boolean;
  showPassword?: boolean;
  passwordLength?: number;
};

export function AnimatedCharacters({
  isTyping = false,
  showPassword = false,
  passwordLength = 0,
}: AnimatedCharactersProps) {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [isPurpleBlinking, setIsPurpleBlinking] = useState(false);
  const [isBlackBlinking, setIsBlackBlinking] = useState(false);
  const [purplePos, setPurplePos] = useState<CharacterPose>({ faceX: 0, faceY: 0, bodySkew: 0 });
  const [blackPos, setBlackPos] = useState<CharacterPose>({ faceX: 0, faceY: 0, bodySkew: 0 });
  const [yellowPos, setYellowPos] = useState<CharacterPose>({ faceX: 0, faceY: 0, bodySkew: 0 });
  const [orangePos, setOrangePos] = useState<CharacterPose>({ faceX: 0, faceY: 0, bodySkew: 0 });

  const purpleRef = useRef<HTMLDivElement>(null);
  const blackRef = useRef<HTMLDivElement>(null);
  const yellowRef = useRef<HTMLDivElement>(null);
  const orangeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMouseX(event.clientX);
      setMouseY(event.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const scheduleBlink = () => {
      const timeout = window.setTimeout(() => {
        setIsPurpleBlinking(true);
        window.setTimeout(() => {
          setIsPurpleBlinking(false);
          scheduleBlink();
        }, 150);
      }, Math.random() * 4000 + 3000);

      return timeout;
    };

    const timeout = scheduleBlink();
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const scheduleBlink = () => {
      const timeout = window.setTimeout(() => {
        setIsBlackBlinking(true);
        window.setTimeout(() => {
          setIsBlackBlinking(false);
          scheduleBlink();
        }, 150);
      }, Math.random() * 4000 + 3000);

      return timeout;
    };

    const timeout = scheduleBlink();
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const computePose = (ref: React.RefObject<HTMLDivElement | null>): CharacterPose => {
      if (!ref.current) return { faceX: 0, faceY: 0, bodySkew: 0 };

      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 3;
      const deltaX = mouseX - centerX;
      const deltaY = mouseY - centerY;

      return {
        faceX: Math.max(-15, Math.min(15, deltaX / 20)),
        faceY: Math.max(-10, Math.min(10, deltaY / 30)),
        bodySkew: Math.max(-6, Math.min(6, -deltaX / 120)),
      };
    };

    setPurplePos(computePose(purpleRef));
    setBlackPos(computePose(blackRef));
    setYellowPos(computePose(yellowRef));
    setOrangePos(computePose(orangeRef));
  }, [mouseX, mouseY]);

  const isHidingPassword = passwordLength > 0 && !showPassword;
  const isLookingAtEachOther = isTyping;
  const isPurplePeeking = passwordLength > 0 && showPassword;

  return (
    <div className="relative h-[280px] w-[380px] sm:h-[340px] sm:w-[470px] lg:h-[400px] lg:w-[550px]">
      <div
        ref={purpleRef}
        className="absolute bottom-0 left-[48px] transition-all duration-700 ease-in-out sm:left-[62px] lg:left-[70px]"
        style={{
          width: "180px",
          height: isTyping || isHidingPassword ? "440px" : "400px",
          backgroundColor: "#6C3FF5",
          borderRadius: "10px 10px 0 0",
          zIndex: 1,
          transform:
            passwordLength > 0 && showPassword
              ? "skewX(0deg)"
              : isTyping || isHidingPassword
                ? `skewX(${purplePos.bodySkew - 12}deg) translateX(40px)`
                : `skewX(${purplePos.bodySkew}deg)`,
          transformOrigin: "bottom center",
        }}
      >
        <div
          className="absolute flex gap-8 transition-all duration-700 ease-in-out"
          style={{
            left:
              passwordLength > 0 && showPassword
                ? "20px"
                : isLookingAtEachOther
                  ? "55px"
                  : `${45 + purplePos.faceX}px`,
            top:
              passwordLength > 0 && showPassword
                ? "35px"
                : isLookingAtEachOther
                  ? "65px"
                  : `${40 + purplePos.faceY}px`,
          }}
        >
          <EyeBall
            size={18}
            pupilSize={7}
            maxDistance={5}
            eyeColor="white"
            pupilColor="#2D2D2D"
            isBlinking={isPurpleBlinking}
            forceLookX={passwordLength > 0 && showPassword ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined}
            forceLookY={passwordLength > 0 && showPassword ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined}
          />
          <EyeBall
            size={18}
            pupilSize={7}
            maxDistance={5}
            eyeColor="white"
            pupilColor="#2D2D2D"
            isBlinking={isPurpleBlinking}
            forceLookX={passwordLength > 0 && showPassword ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined}
            forceLookY={passwordLength > 0 && showPassword ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined}
          />
        </div>
      </div>

      <div
        ref={blackRef}
        className="absolute bottom-0 left-[178px] transition-all duration-700 ease-in-out sm:left-[216px] lg:left-[240px]"
        style={{
          width: "120px",
          height: "310px",
          backgroundColor: "#2D2D2D",
          borderRadius: "8px 8px 0 0",
          zIndex: 2,
          transform:
            passwordLength > 0 && showPassword
              ? "skewX(0deg)"
              : isLookingAtEachOther
                ? `skewX(${blackPos.bodySkew * 1.5 + 10}deg) translateX(20px)`
                : isTyping || isHidingPassword
                  ? `skewX(${blackPos.bodySkew * 1.5}deg)`
                  : `skewX(${blackPos.bodySkew}deg)`,
          transformOrigin: "bottom center",
        }}
      >
        <div
          className="absolute flex gap-6 transition-all duration-700 ease-in-out"
          style={{
            left:
              passwordLength > 0 && showPassword
                ? "10px"
                : isLookingAtEachOther
                  ? "32px"
                  : `${26 + blackPos.faceX}px`,
            top:
              passwordLength > 0 && showPassword
                ? "28px"
                : isLookingAtEachOther
                  ? "12px"
                  : `${32 + blackPos.faceY}px`,
          }}
        >
          <EyeBall
            size={16}
            pupilSize={6}
            maxDistance={4}
            eyeColor="white"
            pupilColor="#2D2D2D"
            isBlinking={isBlackBlinking}
            forceLookX={passwordLength > 0 && showPassword ? -4 : isLookingAtEachOther ? 0 : undefined}
            forceLookY={passwordLength > 0 && showPassword ? -4 : isLookingAtEachOther ? -4 : undefined}
          />
          <EyeBall
            size={16}
            pupilSize={6}
            maxDistance={4}
            eyeColor="white"
            pupilColor="#2D2D2D"
            isBlinking={isBlackBlinking}
            forceLookX={passwordLength > 0 && showPassword ? -4 : isLookingAtEachOther ? 0 : undefined}
            forceLookY={passwordLength > 0 && showPassword ? -4 : isLookingAtEachOther ? -4 : undefined}
          />
        </div>
      </div>

      <div
        ref={orangeRef}
        className="absolute bottom-0 left-0 transition-all duration-700 ease-in-out"
        style={{
          width: "240px",
          height: "200px",
          backgroundColor: "#FF9B6B",
          borderRadius: "120px 120px 0 0",
          zIndex: 3,
          transform: passwordLength > 0 && showPassword ? "skewX(0deg)" : `skewX(${orangePos.bodySkew}deg)`,
          transformOrigin: "bottom center",
        }}
      >
        <div
          className="absolute flex gap-8 transition-all duration-200 ease-out"
          style={{
            left: passwordLength > 0 && showPassword ? "50px" : `${82 + orangePos.faceX}px`,
            top: passwordLength > 0 && showPassword ? "85px" : `${90 + orangePos.faceY}px`,
          }}
        >
          <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={passwordLength > 0 && showPassword ? -5 : undefined} forceLookY={passwordLength > 0 && showPassword ? -4 : undefined} />
          <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={passwordLength > 0 && showPassword ? -5 : undefined} forceLookY={passwordLength > 0 && showPassword ? -4 : undefined} />
        </div>
      </div>

      <div
        ref={yellowRef}
        className="absolute bottom-0 left-[230px] transition-all duration-700 ease-in-out sm:left-[280px] lg:left-[310px]"
        style={{
          width: "140px",
          height: "230px",
          backgroundColor: "#E8D754",
          borderRadius: "70px 70px 0 0",
          zIndex: 4,
          transform: passwordLength > 0 && showPassword ? "skewX(0deg)" : `skewX(${yellowPos.bodySkew}deg)`,
          transformOrigin: "bottom center",
        }}
      >
        <div
          className="absolute flex gap-6 transition-all duration-200 ease-out"
          style={{
            left: passwordLength > 0 && showPassword ? "20px" : `${52 + yellowPos.faceX}px`,
            top: passwordLength > 0 && showPassword ? "35px" : `${40 + yellowPos.faceY}px`,
          }}
        >
          <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={passwordLength > 0 && showPassword ? -5 : undefined} forceLookY={passwordLength > 0 && showPassword ? -4 : undefined} />
          <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={passwordLength > 0 && showPassword ? -5 : undefined} forceLookY={passwordLength > 0 && showPassword ? -4 : undefined} />
        </div>
        <div
          className="absolute h-[4px] w-20 rounded-full bg-[#2D2D2D] transition-all duration-200 ease-out"
          style={{
            left: passwordLength > 0 && showPassword ? "10px" : `${40 + yellowPos.faceX}px`,
            top: passwordLength > 0 && showPassword ? "88px" : `${88 + yellowPos.faceY}px`,
          }}
        />
      </div>
    </div>
  );
}
