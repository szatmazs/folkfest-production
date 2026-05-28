import { getVideos } from '@/app/actions/video-admin'
import VideoList from './video-list'

export default async function VideosPage() {
    const videos = await getVideos()

    return <VideoList initialVideos={videos} />
}
