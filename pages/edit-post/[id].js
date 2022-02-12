import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import ReactMarkdown from 'react-markdown'

import dynamic from 'next/dynamic'
import { ethers } from 'ethers'
import { create } from 'ipfs-http-client'

import { contractAddress } from '../../config'
import Blog from '../../artifacts/contracts/Blog.sol/Blog.json'

const ipfsURI = 'https://ipfs.io/ipfs/'
const client = create('https://ipfs.infura.io:5001/api/v0')

const SimpleMDE = dynamic(() => import('react-simplemde-editor'), { ssr: false })

export default function Post() {
  const [post, setPost] = useState(null)
  const [editing, setEditing] = useState(true)
  const router = useRouter()
  const { id } = router.query

  useEffect(() => {
    fetchPost()
  }, [id])
  async function fetchPost() {
    /* we first fetch the individual post by ipfs hash from the network */
    if (!id) return
    let provider
    if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'local') {
      provider = new ethers.providers.JsonRpcProvider()
    } else if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'testnet') {
      provider = new ethers.providers.JsonRpcProvider('https://rpc-mumbai.matic.today')
    } else {
      provider = new ethers.providers.JsonRpcProvider('https://polygon-rpc.com/')
    }
    const contract = new ethers.Contract(contractAddress, Blog.abi, provider)
    const val = await contract.fetchPost(id)
    const postId = val[0].toNumber()

    /* next we fetch the IPFS metadata from the network */
    const ipfsUrl = `${ipfsURI}/${id}`
    const response = await fetch(ipfsUrl)
    const data = await response.json()
    if (data.coverImage) {
      let coverImagePath = `${ipfsURI}/${data.coverImage}`
      data.coverImagePath = coverImagePath
    }
    /* finally we append the post ID to the post data */
    /* we need this ID to make updates to the post */
    data.id = postId
    setPost(data)
  }

  async function savePostToIpfs() {
    try {
      const added = await client.add(JSON.stringify(post))
      return added.path
    } catch (err) {
      console.log('error: ', err)
    }
  }

  async function updatePost() {
    const hash = await savePostToIpfs()
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, Blog.abi, signer)
    await contract.updatePost(post.id, post.title, hash, true)
    router.push('/')
  }

  if (!post) return null

  return (
    <div className='continaer'>
      {/* editing state will allow the user to toggle between */
      /*  a markdown editor and a markdown renderer */}
      {editing && (
        <div>
          <input
            onChange={(e) => setPost({ ...post, title: e.target.value })}
            name='title'
            placeholder='Give it a title ...'
            value={post.title}
            className='mt-10 border-0 outline-none bg-inherit text-2xl font-semibold placeholder:text-[#999999]'
          />
          <SimpleMDE
            className='mt-10'
            placeholder="What's on your mind?"
            value={post.content}
            onChange={(value) => setPost({ ...post, content: value })}
          />
          <button className='button' onClick={updatePost}>
            Update post
          </button>
        </div>
      )}
      {!editing && (
        <div>
          {post.coverImagePath && <img className='w-[900px]' src={post.coverImagePath} />}
          <h1>{post.title}</h1>
          <div className='mt-14 px-10 border-l-2 border-r-2'>
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
        </div>
      )}
      <button
        className='bg-[#fafafa] outline-none border-0 rounded-2xl cursor-pointer mr-3 mt-3 text-xl py-4 px-16 shadow-lg'
        onClick={() => setEditing(editing ? false : true)}
      >
        {editing ? 'View post' : 'Edit post'}
      </button>
    </div>
  )
}
