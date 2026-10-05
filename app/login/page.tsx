"use client"


import { LoginForm } from "@/components/auth/login-form"
import { GalleryVerticalEndIcon } from "lucide-react"
import { useState, useTransition } from "react"
import { signIn } from 'next-auth/react'
import { useRouter } from "next/router"
import Image from "next/image"
import Silk from "@/components/Silk"

export default function LoginPage() {

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <Silk 
          speed={5}
        
          scale={1}
          color="#4036ff"
          noiseIntensity={1.5}
          rotation={0}
        />
      </div>
    </div>
  )
}
