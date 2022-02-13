import { useContext } from 'react'
import { useRouter } from 'next/router'
import { ethers } from 'ethers'
import Link from 'next/link'
import { AccountContext } from '../context/context'

/* import contract address and contract owner address */
import { contractAddress, ownerAddress } from '../config'

/* import Application Binary Interface (ABI) */
import Blog from '../artifacts/contracts/Blog.sol/Blog.json'

export default function Home(props) {
  /* posts are fetched server side and passed in as props */
  /* see getServerSideProps */
  const { posts } = props
  const account = useContext(AccountContext)

  const router = useRouter()

  async function navigate() {
    router.push('/create-post')
  }

  return (
    <div>
      <div className='w-[700px] mx-auto my-0 pt-12'>
        {
          /* map over the posts array and render a button with the post title */
          posts.map((post, index) => (
            <Link href={`/post/${post[2]}`} key={index}>
              <a>
                <div className='border-2 mt-5 rounded-lg flex'>
                  <p className='text-xl font-semibold cursor-pointer m-0 p-5'>{post[1]}</p>
                  <div className='flex flex-1 justify-end pr-5'>
                    <img className='w-10 h-10 m-4 rotate-90' src='/favicon.ico' alt='Right arrow' />
                  </div>
                </div>
              </a>
            </Link>
          ))
        }
      </div>
      <div className='flex justify-center'>
        {account === ownerAddress && posts && !posts.length && (
          /* if the signed in user is the account owner, render a button */
          /* to create the first post */
          <button
            className='mt-24 bg-[#fafafa] outline-none border-0 text-xl rounded-2xl cursor-pointer shadow-lg'
            onClick={navigate}
          >
            Create your first post
            <img className='w-8 ml-7 rotate-90' src='/favicon.ico' alt='Right arrow' />
          </button>
        )}
      </div>
    </div>
  )
}

export async function getServerSideProps() {
  /* here we check to see the current environment variable */
  /* and render a provider based on the environment we're in */
  let provider
  if (process.env.ENVIRONMENT === 'local') {
    provider = new ethers.providers.JsonRpcProvider()
  } else if (process.env.ENVIRONMENT === 'testnet') {
    provider = new ethers.providers.JsonRpcProvider('https://rpc-mumbai.matic.today')
  } else {
    provider = new ethers.providers.JsonRpcProvider('https://polygon-rpc.com/')
  }

  const contract = new ethers.Contract(contractAddress, Blog.abi, provider)
  const data = await contract.fetchPosts()
  return {
    props: {
      posts: JSON.parse(JSON.stringify(data))
    }
  }
}
