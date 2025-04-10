"use client"

import { createContext, useEffect, useState, type ReactNode } from "react"
import { ethers } from "ethers"

interface WalletContextType {
  address: string | null
  isConnected: boolean
  connect: () => Promise<void>
  disconnect: () => void
  provider: ethers.BrowserProvider | null
  signer: ethers.JsonRpcSigner | null
}

export const WalletContext = createContext<WalletContextType>({
  address: null,
  isConnected: false,
  connect: async () => {},
  disconnect: () => {},
  provider: null,
  signer: null,
})

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)

  useEffect(() => {
    // Check if wallet was previously connected
    const checkConnection = async () => {
      if (window.ethereum && localStorage.getItem("walletConnected") === "true") {
        await connect()
      }
    }

    checkConnection()
  }, [])

  const connect = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        // Request account access
        await window.ethereum.request({ method: "eth_requestAccounts" })

        const browserProvider = new ethers.BrowserProvider(window.ethereum)
        const ethSigner = await browserProvider.getSigner()
        const userAddress = await ethSigner.getAddress()

        setProvider(browserProvider)
        setSigner(ethSigner)
        setAddress(userAddress)
        setIsConnected(true)
        localStorage.setItem("walletConnected", "true")

        // Listen for account changes
        window.ethereum.on("accountsChanged", handleAccountsChanged)
        window.ethereum.on("chainChanged", handleChainChanged)
        window.ethereum.on("disconnect", handleDisconnect)
      } catch (error) {
        console.error("Error connecting wallet:", error)
      }
    } else {
      alert("Please install MetaMask or another Ethereum wallet")
    }
  }

  const disconnect = () => {
    setAddress(null)
    setIsConnected(false)
    setProvider(null)
    setSigner(null)
    localStorage.removeItem("walletConnected")

    // Remove listeners
    if (window.ethereum) {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
      window.ethereum.removeListener("chainChanged", handleChainChanged)
      window.ethereum.removeListener("disconnect", handleDisconnect)
    }
  }

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      // User disconnected their wallet
      disconnect()
    } else {
      // User switched accounts
      setAddress(accounts[0])
    }
  }

  const handleChainChanged = () => {
    // Reload the page when the chain changes
    window.location.reload()
  }

  const handleDisconnect = () => {
    disconnect()
  }

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected,
        connect,
        disconnect,
        provider,
        signer,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}
