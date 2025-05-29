import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, ShoppingCart, Wallet } from "lucide-react";
import { motion } from "framer-motion";
import { create } from "ipfs-http-client";
import { ethers } from "ethers";

const client = create({ url: "https://ipfs.io" });

const CONTRACT_ADDRESS = "0xE405360d19Fe3aC8ac98af16"; // Replace with actual deployed contract address
const CONTRACT_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "recipient", "type": "address" },
      { "internalType": "string", "name": "tokenURI", "type": "string" }
    ],
    "name": "mintNFT",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export default function NFTastic() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [account, setAccount] = useState("");
  const [mintedToken, setMintedToken] = useState(null);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", ([account]) => {
        setAccount(account);
        setWalletConnected(true);
      });
    }
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask to use this feature.");
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
      setWalletConnected(true);
    } catch (error) {
      console.error("Wallet connection failed:", error);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    try {
      setUploading(true);
      const added = await client.add(file);
      const url = `https://ipfs.io/ipfs/${added.path}`;
      console.log("Uploaded to IPFS:", url);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.mintNFT(account, url);
      const receipt = await tx.wait();

      const tokenId = receipt.events[0].args[2].toString();
      console.log("Minted Token ID:", tokenId);
      setMintedToken(tokenId);
      setUploadSuccess(true);
    } catch (err) {
      console.error("Upload or mint error:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-black to-gray-900 text-white font-sans">
      <header className="text-center p-10">
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold tracking-tight text-accent"
        >
          NFTastic
        </motion.h1>
        <p className="text-gray-300 mt-2">Where Art Meets Blockchain</p>
        <div className="mt-4">
          {!walletConnected ? (
            <Button size="lg" className="bg-accent text-black" onClick={connectWallet}>
              <Wallet className="w-5 h-5 mr-2" /> Connect Wallet
            </Button>
          ) : (
            <p className="text-green-400">Connected: {account}</p>
          )}
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-8 py-10">
        {[1, 2, 3, 4, 5, 6].map((id) => (
          <Card
            key={id}
            className="bg-gray-800 border border-gray-700 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300"
          >
            <CardContent className="p-4">
              <img
                src={`https://via.placeholder.com/300x300?text=NFT+${id}`}
                alt={`NFT ${id}`}
                className="rounded-xl w-full object-cover"
              />
              <div className="mt-4 flex justify-between items-center">
                <span className="text-lg font-semibold">NFT #{id}</span>
                <Button size="sm" className="bg-accent text-black">
                  <ShoppingCart className="w-4 h-4 mr-1" /> Buy
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="text-center py-10 px-8 bg-gray-900">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold mb-4"
        >
          Upload Your NFT Art
        </motion.h2>
        <p className="text-gray-400 max-w-xl mx-auto mb-6">
          Share your unique digital creations with the world. Upload, mint, and list your NFTs easily on NFTastic.
        </p>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="mb-4"
        />
        <div>
          <Button size="lg" className="bg-accent text-black" onClick={handleUpload} disabled={uploading}>
            <UploadCloud className="w-5 h-5 mr-2" /> {uploading ? "Uploading..." : "Upload & Mint NFT"}
          </Button>
        </div>
        {uploadSuccess && (
          <p className="text-green-400 mt-4">
            Upload and mint successful! Token ID: {mintedToken}
          </p>
        )}
      </section>

      <footer className="text-center py-6 text-gray-500 text-sm border-t border-gray-700">
        &copy; {new Date().getFullYear()} NFTastic. All rights reserved.
      </footer>
    </main>
  );
}
