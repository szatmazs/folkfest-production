
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPost() {
    // ID for "VI. Somló FolkFest" (deduced from debug output)
    const postId = '106971394411813_818886163988261';

    console.log(`Checking Post ${postId}...`);

    // 1. Check Deleted
    const deleted = await prisma.deletedFacebookPost.findUnique({ where: { id: postId } });
    console.log('Is Deleted (Blocked):', !!deleted);

    // 2. Check Stored Post
    const post = await prisma.facebookPost.findUnique({ where: { id: postId } });
    if (!post) {
        console.log('Post NOT found in DB.');
    } else {
        console.log('Post FOUND in DB.');
        console.log('Message:', post.message);
        if (post.attachments) {
            const attach = JSON.parse(post.attachments);
            const first = attach.data?.[0];
            console.log('Stored Description:', first?.description);
        } else {
            console.log('No attachments stored.');
        }
    }
}

checkPost()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
