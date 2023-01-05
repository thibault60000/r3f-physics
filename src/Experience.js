import { OrbitControls, useGLTF } from "@react-three/drei";
import {
  Physics,
  Debug,
  RigidBody,
  CuboidCollider,
  CylinderCollider,
  InstancedRigidBodies,
} from "@react-three/rapier";
import { Perf } from "r3f-perf";
import { useRef, useState, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
export default function Experience() {
  const cubeRef = useRef();
  const twister = useRef();

  const cubes = useRef();

  const cubeCount = 500;
  const cubesTransforms = useMemo(() => {
    const positions = [];
    const rotations = [];
    const scales = [];

    for (let i = 0; i < cubeCount; i++) {
      positions.push([
        (Math.random() - 0.5) * 8,
        6 + i * 0.2,
        (Math.random() - 0.5) * 8,
      ]);
      rotations.push([Math.random(), Math.random(), Math.random()]);

      const scale = 0.2 + Math.random() * 0.8;
      scales.push([scale, scale, scale]);
    }
    return { positions, rotations, scales };
  }, []);

  const unicorn = useGLTF("./unicorn.gltf");
  const burger = useGLTF("./hamburger.glb");

  const [hitSound] = useState(() => new Audio("./hit.mp3"));

  const cubeJump = () => {
    console.log("cube jump");
    cubeRef.current.applyImpulse({ x: Math.random() - 0.5, y: 5, z: 0 });
    cubeRef.current.applyTorqueImpulse({
      x: Math.random() - 0.5,
      y: Math.random() - 0.5,
      z: Math.random() - 0.5,
    });
  };

  // useEffect(() => {
  //   for (let i = 0; i < cubeCount; i++) {
  //     const matrix = new THREE.Matrix4();
  //     matrix.compose(
  //       new THREE.Vector3(i * 2, 0, 0),
  //       new THREE.Quaternion(),
  //       new THREE.Vector3(1, 1, 1)
  //     );
  //     cubes.current.setMatrixAt(i, matrix);
  //   }
  // }, []);

  const collisionEnter = () => {
    console.log("collision");
    // hitSound.currentTime = 0;
    // hitSound.volume = Math.random();
    // hitSound.play();
  };

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    // time 1381.6910000000908

    const eulerRotation = new THREE.Euler(0, time * 6, 0);
    // Euler {isEuler: true, _x: 0, _y: 1381.6910000000908, _z: 0, _order: 'XYZ'}

    const quaternionRotation = new THREE.Quaternion();
    // Quaternion {isQuaternion: true, _x: 0, _y: 0, _z: 0, _w: 1}

    quaternionRotation.setFromEuler(eulerRotation);
    // {isQuaternion: true, _x: 0, _y: -0.30018232635000897, _z: 0, _w: 0.9538818432841127}

    twister.current.setNextKinematicRotation(quaternionRotation);

    const angle = time * 0.6;

    const x = Math.cos(angle) * 3;
    const z = Math.sin(angle) * 3;

    twister.current.setNextKinematicTranslation({ x, y: -0.8, z });
  });

  return (
    <>
      <Perf position='top-left' />

      <OrbitControls makeDefault />

      <directionalLight castShadow position={[1, 2, 3]} intensity={1.5} />
      <ambientLight intensity={0.5} />

      <Physics gravity={[0, -9.81, 0]}>
        {/* <Debug /> */}

        <RigidBody colliders='ball'>
          <mesh castShadow position={[0, 4, 0]}>
            <sphereGeometry />
            <meshStandardMaterial color='orange' />
          </mesh>
        </RigidBody>

        <RigidBody
          ref={cubeRef}
          gravityScale={1}
          restitution={1}
          friction={0.4}
          mass={1}
          onCollisionEnter={collisionEnter}
          onWake={() => console.log("wake")}
          onSleep={() => console.log("sleep")}
        >
          <mesh castShadow position={[2, 2, 0]} onClick={cubeJump}>
            <boxGeometry />
            <meshStandardMaterial color='mediumpurple' />
          </mesh>
        </RigidBody>

        {/* <RigidBody colliders="hull">  */}
        <RigidBody colliders='trimesh' restitution={1}>
          <mesh
            castShadow
            position={[0, 1, -0.25]}
            rotation={[Math.PI * 0.1, 0, 0]}
          >
            <torusGeometry args={[1, 0.5, 16, 32]} />
            <meshStandardMaterial color='mediumpurple' />
          </mesh>
        </RigidBody>

        <RigidBody type='fixed'>
          <mesh receiveShadow position-y={-1.25}>
            <boxGeometry args={[15, 0.5, 15]} />
            <meshStandardMaterial color='greenyellow' />
          </mesh>
        </RigidBody>

        <RigidBody
          ref={twister}
          position={[0, -0.8, 0]}
          friction={0}
          type='kinematicPosition'
        >
          <mesh castShadow scale={[0.5, 0.5, 5]}>
            <boxGeometry />
            <meshStandardMaterial color='red' />
          </mesh>
        </RigidBody>

        <RigidBody colliders={false} position-x={3} scale={1}>
          <CuboidCollider args={[1, 1.5, 1]} position={[0, 1.5, 0]} />
          <primitive object={unicorn.scene} />
        </RigidBody>

        <RigidBody colliders='trimesh' position={[5, 4, 5]} scale={0.25}>
          <primitive object={burger.scene} mass={1.25} />
          {/* <CylinderCollider args={[2, 1.25]} /> */}
        </RigidBody>

        <RigidBody type='fixed'>
          <CuboidCollider args={[8, 2, 0.5]} position={[0, 1, 8]} />
          <CuboidCollider args={[8, 2, 0.5]} position={[0, 1, -8]} />
          <CuboidCollider args={[0.5, 2, 8]} position={[8, 1, 0]} />
          <CuboidCollider args={[0.5, 2, 8]} position={[-8, 1, 0]} />
        </RigidBody>

        <InstancedRigidBodies
          positions={cubesTransforms.positions}
          rotations={cubesTransforms.rotations}
          scales={cubesTransforms.scales}
        >
          <instancedMesh castShadows ref={cubes} args={[null, null, cubeCount]}>
            <boxGeometry />
            <meshStandardMaterial color='tomato' />
          </instancedMesh>
        </InstancedRigidBodies>
      </Physics>
    </>
  );
}
