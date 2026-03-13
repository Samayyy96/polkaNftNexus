"use client";

import { useState } from "react";
import { ethers, parseUnits } from "ethers";
import axios from "axios";
import NFTMarketplace from "../../contract_data/NFTMarketplace.json";


import "./createNFT.css"; // Import CSS

const contractAddress = "0x413941215Cb808327CfA669a833fE49C20A9535B";
const PINATA_KEY = "06664970337747589b1e";
const SECRET_API = "8a2c3c1493360517aefbbba5478d2dcc767f9f34bdca367c940468e0b1ca14a7";

export default function CreateNFT() {
  const [fileUrl, setFileUrl] = useState(null);
  const [formInput, setFormInput] = useState({
    name: "",
    description: "",
    price: "",
    category: "Artwork",
  });
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);

  async function connectWallet() {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
      } catch (error) {
        console.error("❌ Error connecting to MetaMask:", error);
      }
    } else {
      alert("🦊 MetaMask not installed.");
    }
  }

  async function onChange(e) {
    const file = e.target.files[0];

    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          headers: {
            pinata_api_key: PINATA_KEY,
            pinata_secret_api_key: SECRET_API,
          },
        }
      );

      const ipfsHash = res.data.IpfsHash;
      const url = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
      setFileUrl(url);
    } catch (error) {
      console.error("❌ Error uploading file to IPFS:", error);
    }
    setLoading(false);
  }

  async function createNFT() {
    if (!account) {
      alert("Please connect to MetaMask first.");
      return;
    }

    const { name, description, price, category } = formInput;
    if (!name || !description || !price || !fileUrl) {
      alert("Fill all fields first!");
      return;
    }

    try {
      const metadata = {
        name,
        description,
        image: fileUrl,
      };

      const metadataRes = await axios.post(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        metadata,
        {
          headers: {
            pinata_api_key: PINATA_KEY,
            pinata_secret_api_key: SECRET_API,
          },
        }
      );

      const metadataHash = metadataRes.data.IpfsHash;
      const metadataUrl = `https://gateway.pinata.cloud/ipfs/${metadataHash}`;

      await mintNFT(metadataUrl, category);
    } catch (error) {
      console.error("❌ Error creating NFT:", error);
    }
  }

  async function mintNFT(tokenURI, category) {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, NFTMarketplace.abi, signer);

      const mintingFee = await contract.mintingPrice();

      const categoryMap = {
        Artwork: 0,
        Video: 1,
        GIF: 2,
      };

      const categoryValue = categoryMap[category];

      const tx = await contract.mintToken(tokenURI, categoryValue, {
        value: mintingFee,
      });

      await tx.wait();
      alert("NFT successfully minted!");
    } catch (error) {
      console.error("❌ Minting error:", error);
      alert("Minting failed: " + error.message);
    }
  }

  return (
    <div className="create-container">
      <h2 className="create-title">Create Your NFT</h2>

      <button className="connect-btn" onClick={connectWallet}>
        {account ? `Connected: ${account.substring(0, 6)}...` : "Connect MetaMask"}
      </button>

      <div className="form-group">
        <input
          className="form-input"
          placeholder="NFT Name"
          onChange={(e) => setFormInput({ ...formInput, name: e.target.value })}
        />
        <textarea
          className="form-textarea"
          placeholder="NFT Description"
          onChange={(e) => setFormInput({ ...formInput, description: e.target.value })}
        />
        <input
          className="form-input"
          type="number"
          placeholder="Price in PAS"
          onChange={(e) => setFormInput({ ...formInput, price: e.target.value })}
        />
        <select
          className="form-select"
          onChange={(e) => setFormInput({ ...formInput, category: e.target.value })}
        >
          <option value="Artwork">Artwork</option>
          <option value="Video">Video</option>
          <option value="GIF">GIF</option>
        </select>
        <input className="form-input file-input" type="file" onChange={onChange} />
      </div>

      {loading && <p className="loading">Uploading to IPFS...</p>}
      {fileUrl && <img src={fileUrl} alt="NFT preview" className="nft-preview" />}

      <button className="create-btn" onClick={createNFT}>
        Create NFT
      </button>
      <button> or create with ai </button>
    </div>
  );
}
