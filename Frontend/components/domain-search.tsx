"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useWallet } from "@/hooks/use-wallet"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Check, Loader2 } from "lucide-react"
import { ethers } from "ethers"

export function DomainSearch() {
  const [domainName, setDomainName] = useState("")
  const [isChecking, setIsChecking] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [owner, setOwner] = useState<string | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const { isConnected, connect, signer, getContractOne, getContractTwo } = useWallet()
  const router = useRouter()

  // Helper to ensure domain names use .core
  const formatDomainName = (name: string) => {
    if (!name) return ""
    const trimmed = name.trim().toLowerCase()
    return trimmed.endsWith(".core") ? trimmed : `${trimmed}.core`
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDomainName(e.target.value)
    // Reset states when input changes
    setIsAvailable(null)
    setOwner(null)
  }

  const checkAvailability = async () => {
    if (!domainName.trim()) return

    const formattedName = formatDomainName(domainName)
    setIsChecking(true)

    try {
      // Compute the domain hash to be used as key (ensuring the same encoding as in Solidity)
      const domainHash = ethers.encodeBytes32String(formattedName)

      console.log(domainHash)
      
      // Retrieve the ENSRegistry instance from context
      const ensRegistry = getContractOne()
      if (!ensRegistry) throw new Error("ENS Registry contract is not loaded")
      
      // Call getSpecificRecord from the ENSRegistry contract
      const record = await ensRegistry.getSpecificRecord(domainHash)
      // record: { owner, resolver, registration, expiration }
      console.log("heyy")

      console.log(record.owner);
      console.log(record.expiration);
      console.log(record.domainn);

      // Owner is available if it is the zero-address or its expiration is in the past.
      const zeroAddress = "0x0000000000000000000000000000000000000000"
      // Convert the expiration from BigNumber to a number (timestamp in seconds)
      const expirationTimestamp = parseInt(record.expiration.toString())
      const currentTimestamp = Math.floor(Date.now() / 1000)

      if (record.owner === zeroAddress || expirationTimestamp < currentTimestamp) {
        setIsAvailable(true)
      } else {
        setIsAvailable(false)
        setOwner(record.owner)
      }
      setShowDialog(true)
    } catch (error) {
      console.error("Error checking domain availability:", error)
    } finally {
      setIsChecking(false)
    }
  }

  const registerDomain = async () => {
    if (!isConnected) {
      await connect()
      return
    }
    if (!isAvailable) return
  
    const formattedName = formatDomainName(domainName)
    setIsRegistering(true)
  
    try {
      // Compute the domain hash
      const domainHash = ethers.encodeBytes32String(formattedName)
      
      const registrar = getContractTwo()
      if (!registrar) throw new Error("Registrar contract is not loaded")
      
      // Submit the transaction
      const tx = await registrar.register(domainHash, {
        value: ethers.parseEther("1.0"),
      })
      console.log("Transaction sent. Waiting for confirmation...")
      
      await tx.wait()
      console.log("Transaction confirmed.")
  
      setRegistrationSuccess(true)
      // Optionally, delay redirecting the user until after new data is loaded.
      setTimeout(() => {
        setShowDialog(false)
        router.push("/dashboard")
      }, 2000)
    } catch (error) {
      console.error("Error registering domain:", error)
    } finally {
      setIsRegistering(false)
    }
  }
  


  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row w-full items-center gap-3">
        <div className="relative w-full">
          <Input
            type="text"
            placeholder="Enter domain name"
            value={domainName}
            onChange={handleInputChange}
            className="w-full h-12 text-lg px-4"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            {domainName && !domainName.endsWith(".core") ? ".core" : ""}
          </span>
        </div>
        <Button
          onClick={checkAvailability}
          disabled={!domainName.trim() || isChecking}
          className="w-full sm:w-auto h-12 px-8 text-lg"
        >
          {isChecking ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Checking
            </>
          ) : (
            "Check"
          )}
        </Button>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Domain Registration</DialogTitle>
            <DialogDescription>{formatDomainName(domainName)}</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {isAvailable === true && (
              <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                <Check className="h-4 w-4 text-green-500" />
                <AlertTitle className="text-green-500">Available!</AlertTitle>
                <AlertDescription>
                  This domain is available for registration.
                </AlertDescription>
              </Alert>
            )}

            {isAvailable === false && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Already Registered</AlertTitle>
                <AlertDescription>
                  This domain has already been registered by {owner}.
                </AlertDescription>
              </Alert>
            )}

            {registrationSuccess && (
              <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                <Check className="h-4 w-4 text-green-500" />
                <AlertTitle className="text-green-500">Success!</AlertTitle>
                <AlertDescription>
                  Domain successfully registered. Redirecting to your dashboard...
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            {isAvailable && !registrationSuccess && (
              <Button onClick={registerDomain} disabled={isRegistering} className="w-full">
                {isRegistering ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Register Domain"
                )}
              </Button>
            )}

            {!isAvailable && (
              <Button
                variant="outline"
                onClick={() => setShowDialog(false)}
                className="w-full"
              >
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
