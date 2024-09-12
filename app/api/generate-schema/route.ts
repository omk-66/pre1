import { promises as fs } from 'fs';
import { exec } from 'child_process';
import { NextResponse, NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { columns, dataTypes, fileData } = await req.json();

        // Generate a unique model name for this dataset
        const modelName = `FishCatch_${Date.now()}`;

        // Create a dynamic Prisma model schema
        const schema = `
      model ${modelName} {
        id    Int     @id @default(autoincrement())
        ${columns.map((col) => `${col} ${dataTypes[col]}`).join('\n')}
      }
    `;

        // Append the new model to the Prisma schema file
        await fs.appendFile('prisma/schema.prisma', schema);

        // Run Prisma migrate to update the database with the new model
        exec('npx prisma migrate dev --name update_dynamic_schema', (error) => {
            if (error) {
                throw new Error('Migration failed');
            }
        });

        // Optionally insert the parsed data into the new model after migration (not implemented here)

        return NextResponse.json({ message: 'Schema generated and migration triggered successfully.' });

    } catch (error) {
        console.error('Error generating schema:', error);
        return NextResponse.json({ error: 'Failed to generate schema' }, { status: 500 });
    }
}
