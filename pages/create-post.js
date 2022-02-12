import { useState, useRef, useEffect } from 'react' // new
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import { ethers } from 'ethers'
import { create } from 'ipfs-http-client'
import 'easymde/dist/easymde.min.css'
/* import contract address and contract owner address */
import { contractAddress } from '../config'

import Blog from '../artifacts/contracts/Blog.sol/Blog.json'

/* define the ipfs endpoint */
const client = create('https://ipfs.infura.io:5001/api/v0')

/* configure the markdown editor to be client-side import */
const SimpleMDE = dynamic(() => import('react-simplemde-editor'), { ssr: false })

const initialState = { title: '', content: '' }

export default function CreatePost() {
  /* configure initial state to be used in the component */
  const [post, setPost] = useState(initialState)
  const [image, setImage] = useState(null)
  const [loaded, setLoaded] = useState(false)

  const fileRef = useRef(null)
  const { title, content } = post
  const router = useRouter()

  useEffect(() => {
    setTimeout(() => {
      /* delay rendering buttons until dynamic import is complete */
      setLoaded(true)
    }, 500)
  }, [])

  function onChange(e) {
    setPost(() => ({ ...post, [e.target.name]: e.target.value }))
  }

  async function createNewPost() {
    /* saves post to ipfs then anchors to smart contract */
    if (!title || !content) return
    const hash = await savePostToIpfs()
    await savePost(hash)
    router.push(`/`)
  }

  async function savePostToIpfs() {
    /* save post metadata to ipfs */
    try {
      const added = await client.add(JSON.stringify(post))
      return added.path
    } catch (err) {
      console.log('error: ', err)
    }
  }

  async function savePost(hash) {
    /* anchor post to smart contract */
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const contract = new ethers.Contract(contractAddress, Blog.abi, signer)
      console.log('contract: ', contract)
      try {
        const val = await contract.createPost(post.title, hash)
        /* optional - wait for transaction to be confirmed before rerouting */
        /* await provider.waitForTransaction(val.hash) */
        console.log('val: ', val)
      } catch (err) {
        console.log('Error: ', err)
      }
    }
  }

  function triggerOnChange() {
    /* trigger handleFileChange handler of hidden file input */
    fileRef.current.click()
  }

  async function handleFileChange(e) {
    /* upload cover image to ipfs and save hash to state */
    const uploadedFile = e.target.files[0]
    if (!uploadedFile) return
    const added = await client.add(uploadedFile)
    setPost((state) => ({ ...state, coverImage: added.path }))
    setImage(uploadedFile)
  }

  return (
    <div className='w-[800px] my-0 mx-auto'>
      {image && <img className='max-w-3xl' src={URL.createObjectURL(image)} />}
      <input
        onChange={onChange}
        name='title'
        placeholder='Give it a title ...'
        value={post.title}
        className='mt-10 border-0 outline-none bg-inherit text-4xl font-semibold placeholder:text-[#999999]'
      />
      <SimpleMDE
        className='mt-10'
        placeholder="What's on your mind?"
        value={post.content}
        onChange={(value) => setPost({ ...post, content: value })}
      />
      {loaded && (
        <>
          <button
            className='bg-[#fafafa] outline-none rounded-xl cursor-pointer mr-3 text-xl py-4 px-16 shadow-lg'
            type='button'
            onClick={createNewPost}
          >
            Publish
          </button>
          <button
            className='bg-[#fafafa] outline-none rounded-xl cursor-pointer mr-3 text-xl py-4 px-16 shadow-lg'
            onClick={triggerOnChange}
          >
            Add cover image
          </button>
        </>
      )}
      <input
        className='hidden'
        id='selectImage'
        type='file'
        onChange={handleFileChange}
        ref={fileRef}
      />
    </div>
  )
}
