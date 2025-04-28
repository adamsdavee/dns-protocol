"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/hooks/use-wallet"
import { Button } from "@/components/ui/button"
import { Loader2, Network, Check, AlertCircle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export function NetworkSwitcher() {
  const { isConnected, networkStatus, switchNetwork } = useWallet()
  const {
    isCorrectNetwork,
    currentNetworkName,
    isSwitchingNetwork,
    networkError,
  } = networkStatus

  const [showNetworkBanner, setShowNetworkBanner] = useState(false)

  // show banner whenever on wrong network
  useEffect(() => {
    setShowNetworkBanner(isConnected && !isCorrectNetwork)
  }, [isConnected, isCorrectNetwork])

  if (!isConnected) {
    return (
      <Button variant="outline" disabled className="flex items-center gap-2">
        <Network className="h-4 w-4" />
        <span className="hidden sm:inline">Network</span>
      </Button>
    )
  }

  if (isSwitchingNetwork) {
    return (
      <Button variant="outline" disabled className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="hidden sm:inline">Switching...</span>
      </Button>
    )
  }

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={`flex items-center gap-2 ${
              isCorrectNetwork
                ? "border-orange-500 text-orange-500"
                : "border-red-500 text-red-500"
            }`}
          >
            {isCorrectNetwork ? (
              <Check className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
              {isCorrectNetwork ? "CoreTestnet2" : currentNetworkName || "Unknown"}
            </span>
            {!isCorrectNetwork && (
              <Badge variant="destructive" className="ml-1 hidden sm:flex">
                Switch
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1 text-sm font-medium">Select Network</div>
          <DropdownMenuItem onClick={switchNetwork} className="flex justify-between">
            <span>CoreTestnet2</span>
            {isCorrectNetwork && <Check className="h-4 w-4 text-orange-500" />}
          </DropdownMenuItem>
          {!isCorrectNetwork && currentNetworkName && (
            <DropdownMenuItem disabled className="opacity-50 flex justify-between">
              <span>Current: {currentNetworkName}</span>
              <span className="text-xs text-red-500">(Not Supported)</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {showNetworkBanner && (
        <div className="mt-2">
          <div className="bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800 rounded-md p-4 flex items-start" role="alert">
            <AlertCircle className="h-5 w-5 text-red-500 mt-1" />
            <div className="ml-3 flex-1">
              <p className="font-semibold text-red-700 dark:text-red-400">Wrong Network</p>
              <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                Please switch to CoreTestnet2.
              </p>
              {networkError && <p className="text-xs text-red-600 mt-1">{networkError}</p>}
              <Button
                variant="destructive"
                size="sm"
                onClick={switchNetwork}
                className="mt-2 w-full"
              >
                Switch to CoreTestnet2
              </Button>
            </div>
            <button onClick={() => setShowNetworkBanner(false)} className="ml-4 text-red-500 hover:text-red-700">
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
