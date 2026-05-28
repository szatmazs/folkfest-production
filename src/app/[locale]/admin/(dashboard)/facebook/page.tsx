import { getAdminFacebookPosts } from '@/app/actions/facebook-admin'
import { FacebookPostList } from './post-list'
import TokenDebugger from './token-debugger'

export default async function FacebookAdminPage() {
    const posts = await getAdminFacebookPosts()

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Facebook Hírek Kezelése</h1>
            <TokenDebugger />
            <FacebookPostList posts={posts} />
        </div>
    )
}
