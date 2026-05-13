/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useState } from 'react'
import { IconUpload } from '@tabler/icons-react'
import { motion } from 'motion/react'
import { useDropzone } from 'react-dropzone'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const mainVariant = {
  initial: {
    x: 0,
    y: 0,
  },
  animate: {
    x: 20,
    y: -20,
    opacity: 0.9,
  },
}

const secondaryVariant = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
}

export const FileUpload = ({
  onChange,
}: {
  onChange?: (files: File[]) => void
}) => {
  const [files, setFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (newFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...newFiles])
    onChange?.(newFiles)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const { getRootProps, isDragActive } = useDropzone({
    multiple: false,
    noClick: true,
    onDrop: handleFileChange,
    onDropRejected: (error) => {
      console.log(error)
    },
  })

  return (
    <div className='w-full' {...getRootProps()}>
      <motion.div
        onClick={handleClick}
        whileHover='animate'
        className='group/file relative block w-full cursor-pointer overflow-hidden rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm'
      >
        <input
          ref={fileInputRef}
          id='file-upload-handle'
          type='file'
          onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
          className='hidden'
        />

        <div className='flex flex-col items-center justify-center gap-4 text-center'>
          <div className='flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background shadow-sm'>
            <IconUpload className='h-5 w-5 text-muted-foreground' />
          </div>

          <div>
            <p className='text-base font-semibold text-foreground'>
              Upload file
            </p>
            <p className='mt-1 text-sm text-muted-foreground'>
              Drag and drop your file here or click to browse
            </p>
          </div>

          <Button type='button' variant='outline' size='sm'>
            Choose file
          </Button>

          <div className='relative mx-auto mt-2 w-full max-w-xl'>
            {files.length > 0 &&
              files.map((file, idx) => (
                <motion.div
                  key={`file-${idx}`}
                  layoutId={idx === 0 ? 'file-upload' : `file-upload-${idx}`}
                  className='relative z-40 mx-auto mt-3'
                >
                  <Card className='border-border/70 bg-background shadow-sm'>
                    <CardContent className='p-4'>
                      <div className='flex items-start justify-between gap-4'>
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          layout
                          className='min-w-0 truncate text-sm font-medium text-foreground'
                        >
                          {file.name}
                        </motion.p>

                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          layout
                          className='shrink-0 text-xs text-muted-foreground'
                        >
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </motion.p>
                      </div>

                      <div className='mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground'>
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          layout
                        >
                          {file.type || 'Unknown type'}
                        </motion.p>

                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          layout
                        >
                          Modified{' '}
                          {new Date(file.lastModified).toLocaleDateString()}
                        </motion.p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

            {!files.length && (
              <motion.div
                layoutId='file-upload'
                variants={mainVariant}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 20,
                }}
                className={cn(
                  'relative z-40 mx-auto mt-4 flex h-28 w-full max-w-40 items-center justify-center rounded-lg border border-dashed border-border bg-background shadow-sm',
                  'group-hover/file:border-primary/40'
                )}
              >
                {isDragActive ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className='flex flex-col items-center gap-2 text-sm text-muted-foreground'
                  >
                    Drop it
                    <IconUpload className='h-4 w-4 text-muted-foreground' />
                  </motion.p>
                ) : (
                  <IconUpload className='h-5 w-5 text-muted-foreground' />
                )}
              </motion.div>
            )}

            {!files.length && (
              <motion.div
                variants={secondaryVariant}
                className='pointer-events-none absolute inset-0 z-30 mx-auto mt-4 flex h-28 w-full max-w-40 items-center justify-center rounded-lg border border-dashed border-primary/40 bg-transparent opacity-0'
              />
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
