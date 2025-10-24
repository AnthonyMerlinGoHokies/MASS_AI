import { useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'
import * as THREE from 'three'

// Network nodes positions - recreating the structure from your logo
const networkNodes = [
  // Left cluster
  { id: 0, position: [-2, 1, 0], connections: [1, 2, 6] },
  { id: 1, position: [-1.5, 0.5, 0], connections: [0, 2, 3, 6] },
  { id: 2, position: [-1.5, -0.5, 0], connections: [0, 1, 3, 7] },
  { id: 3, position: [-1, 0, 0], connections: [1, 2, 4, 6, 7] },
  { id: 4, position: [-0.5, -1, 0], connections: [3, 7, 8] },
  
  // Center nodes
  { id: 5, position: [0, 1.5, 0], connections: [6, 9] },
  { id: 6, position: [0, 0.5, 0], connections: [0, 1, 3, 5, 7, 9, 10] },
  { id: 7, position: [0, -0.5, 0], connections: [2, 3, 4, 6, 8, 10, 11] },
  { id: 8, position: [0, -1.5, 0], connections: [4, 7, 11] },
  
  // Right cluster
  { id: 9, position: [1, 1, 0], connections: [5, 6, 10] },
  { id: 10, position: [1.5, 0.5, 0], connections: [6, 7, 9, 11, 12] },
  { id: 11, position: [1.5, -0.5, 0], connections: [7, 8, 10, 12] },
  { id: 12, position: [2, 0, 0], connections: [10, 11] },
]

interface NodeProps {
  position: [number, number, number]
  color: string
}

const NetworkNode = ({ position, color }: NodeProps) => {
  const meshRef = useRef<THREE.Mesh>(null!)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5
    }
  })

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
    </mesh>
  )
}

interface ConnectionProps {
  start: Vector3
  end: Vector3
  color: string
}

const NetworkConnection = ({ start, end, color }: ConnectionProps) => {
  const points = [start, end]
  
  return (
    <mesh>
      <tubeGeometry args={[new THREE.CatmullRomCurve3(points), 20, 0.01, 8, false]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
    </mesh>
  )
}

const NetworkGraph = () => {
  const groupRef = useRef<THREE.Group>(null!)
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.2
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1
    }
  })

  // Create gradient colors from cyan to purple
  const getNodeColor = (index: number) => {
    const ratio = index / (networkNodes.length - 1)
    const cyan = new THREE.Color(0x7AF0FF)
    const purple = new THREE.Color(0xB389FF)
    return cyan.clone().lerp(purple, ratio).getHexString()
  }

  const getConnectionColor = (startIndex: number, endIndex: number) => {
    const ratio = (startIndex + endIndex) / (2 * (networkNodes.length - 1))
    const cyan = new THREE.Color(0x7AF0FF)
    const purple = new THREE.Color(0xB389FF)
    return cyan.clone().lerp(purple, ratio).getHexString()
  }

  return (
    <group ref={groupRef}>
      {/* Render connections first (behind nodes) */}
      {networkNodes.map((node) =>
        node.connections.map((connectionId) => {
          if (connectionId > node.id) { // Avoid duplicate connections
            const connectedNode = networkNodes.find(n => n.id === connectionId)
            if (connectedNode) {
              return (
                <NetworkConnection
                  key={`${node.id}-${connectionId}`}
                  start={new Vector3(...node.position)}
                  end={new Vector3(...connectedNode.position)}
                  color={`#${getConnectionColor(node.id, connectionId)}`}
                />
              )
            }
          }
          return null
        })
      )}
      
      {/* Render nodes */}
      {networkNodes.map((node) => (
        <NetworkNode
          key={node.id}
          position={node.position as [number, number, number]}
          color={`#${getNodeColor(node.id)}`}
        />
      ))}
      
      {/* Ambient lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[2, 2, 2]} intensity={0.8} color="#7AF0FF" />
      <pointLight position={[-2, -2, 2]} intensity={0.8} color="#B389FF" />
    </group>
  )
}

interface Logo3DProps {
  className?: string
}

const Logo3D = ({ className }: Logo3DProps) => {
  return (
    <div className={className}>
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <NetworkGraph />
      </Canvas>
    </div>
  )
}

export default Logo3D