import { Injectable, InternalServerErrorException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    S3Client,
    PutObjectCommand,
    CreateBucketCommand,
    GetObjectCommand,
    HeadBucketCommand,
    PutBucketPolicyCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class DmsService implements OnModuleInit {
    private client: S3Client;
    private bucketName = this.configService.get<string>('S3_BUCKET_NAME');

    constructor(
        private readonly configService: ConfigService,
    ) {
        const s3_region = this.configService.get<string>('S3_REGION');
        const endpoint = this.configService.get<string>('S3_ENDPOINT');
        const accessKeyId = this.configService.get<string>('S3_ACCESS_KEY');
        const secretAccessKey = this.configService.get<string>('S3_SECRET_ACCESS_KEY');

        if (!s3_region) {
            console.warn('S3_REGION not found in environment variables');
            throw new Error('S3_REGION not found in environment variables');
        }

        this.client = new S3Client({
            region: s3_region,
            credentials: {
                accessKeyId: accessKeyId,
                secretAccessKey: secretAccessKey
            },
        });

    }

    async onModuleInit() {
        await this.ensureBucketExists();
    }

    private async ensureBucketExists() {
        try {
            await this.client.send(new HeadBucketCommand({ Bucket: this.bucketName! }));
            console.log(`Bucket "${this.bucketName}" already exists.`);
        } catch (err: any) {
            if (err?.$metadata?.httpStatusCode === 404) {
                console.log(`Bucket "${this.bucketName}" does not exist. Creating...`);
                await this.client.send(
                    new CreateBucketCommand({
                        Bucket: this.bucketName,
                    })
                )
                console.log(`Bucket "${this.bucketName}" created successfully.`);
                console.log(`Setting public read policy for bucket "${this.bucketName}"...`);
                const publicReadPolicy = {
                    Version: "2012-10-17",
                    Statement: [
                        {
                            Sid: "PublicReadGetObject",
                            Effect: "Allow",
                            Principal: "*",
                            Action: "s3:GetObject",
                            Resource: `arn:aws:s3:::${this.bucketName}/*`
                        }
                    ]
                };
                await this.client.send(
                    new PutBucketPolicyCommand({
                        Bucket: this.bucketName,
                        Policy: JSON.stringify(publicReadPolicy)
                    })
                );
                console.log(`Public read policy set for bucket "${this.bucketName}".`);
            } else {
                console.error("Error checking/creating bucket:", err);
                throw new InternalServerErrorException('Failed to verify or create S3 bucket.')
            }
        }
    }

    async uploadSingleFile({
        file,
        key,
        isPublic = true,
    }: {
        file: Express.Multer.File;
        key: string;
        isPublic: boolean;
    }) {
        try {
            const command = new PutObjectCommand({
                Bucket: this.bucketName || "dev-test-firstlane-bucket",
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,

                Metadata: {
                    originalName: file.originalname,
                },
            });

            await this.client.send(command);

            return {
                url: isPublic
                    ? (await this.getFileUrl(key))
                    : (await this.getPresignedSignedUrl(key)).url,
                key,
                isPublic,
            };
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    async getFileUrl(key: string) {
        const region = this.configService.get<string>('S3_REGION');
        return `https://${this.bucketName}.s3.${region}.amazonaws.com/${key}`;
    }



    async getPresignedSignedUrl(key: string) {
        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });
        const url = await getSignedUrl(this.client, command, { expiresIn: 3600 });
        return { url };
    }

}
