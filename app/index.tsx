import React, { Suspense, useEffect, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber/native";
import {
  useAnimations,
  useGLTF,
  OrbitControls
} from "@react-three/drei/native";
import person from "../assets/models/person.glb";

import { SafeAreaView, Text, TouchableOpacity } from "react-native";
import {
  useAnimatedSensor,
  SensorType,
  AnimatedSensor,
  Value3D
} from "react-native-reanimated";

interface ModelProps
  extends Omit<JSX.IntrinsicElements["primitive"], "object"> {
  object?: object;
  isPlaying: boolean;
  animatedSensor: AnimatedSensor<Value3D>;
  triggerJump: boolean;
  setTriggerJump: (isJumping: boolean) => void;
}

function Model({
  isPlaying,
  triggerJump,
  animatedSensor,
  setTriggerJump,
  ...props
}: ModelProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const personRunning = useGLTF(person);

  const { animations, scene } = personRunning;
  const { actions } = useAnimations(animations, meshRef);

  actions["jump-animation"]?.syncWith(actions["running-animation"]!);

  useEffect(() => {
    if (isPlaying) {
      actions["running-animation"]?.reset();
      actions["running-animation"]?.play();
      actions["running-animation"]?.fadeIn(1);
    } else {
      actions["running-animation"]?.fadeOut(1);
    }
  }, [isPlaying]);

  useEffect(() => {
    actions["running-animation"]?.stop();
    actions["jump-animation"]?.reset();
    actions["jump-animation"]?.play();
    actions["jump-animation"]
      ?.crossFadeTo(actions["running-animation"]!, 1, true)
      .play();
  }, [triggerJump]);

  useFrame((state, delta) => {
    let { x, y, z } = animatedSensor.sensor.value;

    x = ~~(x * 100) / 2000;
    y = ~~(y * 100) / 2000;

    meshRef.current.rotation.y += y;
    meshRef.current.rotation.x += x;
  });

  return (
    <mesh {...props} ref={meshRef} rotation={[0.2, 0, 0]}>
      <primitive object={scene} />
    </mesh>
  );
}

export default function App() {
  const animatedSensor = useAnimatedSensor(SensorType.GYROSCOPE, {
    interval: 100
  });

  const [isPlaying, setIsPlaying] = React.useState(true);
  const [triggerJump, setTriggerJump] = React.useState(false);

  const handleStop = () => {
    setIsPlaying(!isPlaying);
  };

  const handleJump = () => {
    setTriggerJump(!triggerJump);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Canvas
        onCreated={(state) => {
          const _gl = state.gl.getContext();
          const pixelStorei = _gl.pixelStorei.bind(_gl);
          _gl.pixelStorei = function (...args) {
            const [parameter] = args;
            switch (parameter) {
              case _gl.UNPACK_FLIP_Y_WEBGL:
                return pixelStorei(...args);
            }
          };
        }}
      >
        <ambientLight intensity={Math.PI / 2} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          decay={0}
          intensity={Math.PI}
        />
        <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
        <Suspense fallback={null}>
          <Model
            animatedSensor={animatedSensor}
            position={[0, -1, 1]}
            isPlaying={isPlaying}
            triggerJump={triggerJump}
            setTriggerJump={setTriggerJump}
          />
        </Suspense>

        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
      <TouchableOpacity
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          backgroundColor: isPlaying ? "red" : "green",
          padding: 50
        }}
        onPress={handleStop}
      >
        <Text>{isPlaying ? "Stop" : "Play"}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          backgroundColor: "green",
          padding: 50
        }}
        onPress={handleJump}
      >
        <Text>Jump</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
