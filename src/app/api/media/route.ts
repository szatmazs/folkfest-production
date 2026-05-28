import { NextResponse } from 'next/server'
import { readdir, stat } from 'fs/promises'
import { join } from 'path'

export async function GET() {
    try {
        const uploadsDir = join(process.cwd(), 'public', 'uploads')
        
        // Helperes to recursively get all files
        async function getFiles(dir: string, baseDir: string = ''): Promise<{ url: string, name: string, date: Date, size: number }[]> {
            let files: { url: string, name: string, date: Date, size: number }[] = []
            
            try {
                const entries = await readdir(dir, { withFileTypes: true })
                
                for (const entry of entries) {
                    const fullPath = join(dir, entry.name)
                    const relPath = join(baseDir, entry.name)
                    
                    if (entry.isDirectory()) {
                        files = [...files, ...(await getFiles(fullPath, relPath))]
                    } else if (entry.isFile() && !entry.name.startsWith('.')) {
                        const fileStat = await stat(fullPath)
                        files.push({
                            url: `/uploads/${relPath.replace(/\\/g, '/')}`,
                            name: entry.name,
                            date: fileStat.mtime,
                            size: fileStat.size
                        })
                    }
                }
            } catch (error) {
                // Return empty if directory doesn't exist
                console.warn(`Could not read directory ${dir}`, error)
            }
            
            return files
        }

        const allFiles = await getFiles(uploadsDir)
        
        // Sort by date descending (newest first)
        allFiles.sort((a, b) => b.date.getTime() - a.date.getTime())

        return NextResponse.json(allFiles)
    } catch (error) {
        console.error('Error reading media files:', error)
        return NextResponse.json({ error: 'Failed to read media files' }, { status: 500 })
    }
}
