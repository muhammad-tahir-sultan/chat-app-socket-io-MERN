import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import assets from '../assets/assets'
import { authContext } from '../../context/authContext'
const ProfilePage = () => {

  const { authUser, updateProfile } = useContext(authContext)

  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(authUser?.profilePic ?? null);


  const navigate = useNavigate()
  const [name, setName] = useState(authUser?.fullName)
  const [bio, setBio] = useState(authUser?.bio)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedImage) {
      await updateProfile({ fullName: name, bio })
      navigate("/")
      return;
    }

    const reader = new FileReader()
    reader.readAsDataURL(selectedImage)
    reader.onload = async () => {
      const base64Image = reader.result
      await updateProfile({ profilePic: base64Image, fullName: name, bio })
      navigate("/")
      navigate
    }
  }
  return (
    <div className='min-h-screen bg-cover bg-no-repeat flex items-center justify-center '>

      <div className='w-5/6 max-w-2xl backdrop-blur-2xl text-gray-300 border-2 border-gray-600 flex items-center justify-between max-sm:flex-col-reverse rounded-lg '>
        <form onSubmit={handleSubmit} className='flex flex-col gap-5 p-10 flex-1'>
          <h3 className='text-lg '>Profile Details</h3>

          <label htmlFor="avatar" className='flex items-center gap-3 cursor-pointer'>
            <input
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setSelectedImage(file);
                  setPreviewImage(URL.createObjectURL(file)); // ✅ safe preview
                }
              }}
              type="file"
              id="avatar"
              accept=".png, .jpg, .jpeg"
              hidden
            />
            <img
              src={previewImage || assets.avatar_icon}
              alt="user"
              className={`w-12 h-12 ${previewImage && "rounded-full"}`}
            />
            upload profile image
          </label>

          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            type="text"
            required
            placeholder='Your Name'
            className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500' />

          <textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            placeholder='Write profile bio...'
            required
            className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500' rows={4}></textarea>

          <button type='submit' className='p-2 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-full text-lg cursor-pointer'>Save</button>

        </form>
        <img className={`max-w-44 aspect-square rounded-full mx-10 max-sm:mt-10 ${selectedImage && 'rounded-full'}`} src={previewImage || assets.logo_icon} alt="logo" />
      </div>

    </div>
  )
}


export default ProfilePage