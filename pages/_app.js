import { useState } from 'react'
import '../styles/globals.css'
import Link from 'next/link'
import Web3Modal from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'
import { ethers } from 'ethers'
import { AccountContext } from '../context/context'
import { ownerAddress } from '../config'

function MyApp({ Component, pageProps }) {
  const [account, setAccount] = useState(null)
  async function getWeb3Modal() {
    const web3Modal = new Web3Modal({
      network: 'mainnet',
      cacheProvider: false,
      providerOptions: {
        walletconnect: {
          package: WalletConnectProvider,
          options: {
            infuraId: process.env.NEXT_PUBLIC_INFURA_ID
          }
        }
      }
    })
    return web3Modal
  }

  async function connect() {
    try {
      const web3Modal = await getWeb3Modal()
      const connection = await web3Modal.connect()
      const provider = new ethers.providers.Web3Provider(connection)
      const accounts = await provider.listAccounts()
      setAccount(accounts[0])
    } catch (err) {
      console.log('error:', err)
    }
  }

  return (
    <div>
      <nav className='bg-white'>
        <div className='flex border-b-2 py-5 px-8'>
          <Link href='/'>
            <a>
              <img
                src='/logo.svg'
                className='bg-blue-500'
                alt='React Logo'
                style={{ width: '50px' }}
              />
            </a>
          </Link>
          <Link href='/'>
            <a>
              <div className='flex flex-col pl-4'>
                <h2 className='font-semibold m-0'>Full Stack</h2>
                <p className='m-0 text-gray-600'>WEB3</p>
              </div>
            </a>
          </Link>
          {!account && (
            <div className='w-full flex flex-1 justify-end'>
              <button
                className='bg-gray-400 outline-none b-0 text-2xl py-4 px-16 rounded-xl cursor-pointer shadow-lg'
                onClick={connect}
              >
                Connect
              </button>
            </div>
          )}
          {account && <p className='w-full flex flex-1 justify-end text-xl'>{account}</p>}
        </div>
        <div className='py-7 px-14 bg-[#fafafa]'>
          <Link href='/'>
            <a className='m-0 ml-10 text-xl font-normal'>Home</a>
          </Link>
          {
            /* if the signed in user is the contract owner, we */
            /* show the nav link to create a new post */
            account === ownerAddress && (
              <Link href='/create-post'>
                <a className='m-0 ml-10 text-xl font-normal'>Create Post</a>
              </Link>
            )
          }
        </div>
      </nav>
      <div className='p-10'>
        <AccountContext.Provider value={account}>
          <Component {...pageProps} connect={connect} />
        </AccountContext.Provider>
      </div>
    </div>
  )
}

export default MyApp
