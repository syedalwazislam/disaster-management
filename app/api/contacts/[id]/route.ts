import { MongoClient, ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { name, email, message } = await request.json();
  const client = await MongoClient.connect(process.env.MONGODB_URI!);
  const db = client.db(process.env.MONGODB_DB);
  
  const result = await db.collection('contacts').updateOne(
    { _id: new ObjectId(id) },
    { $set: { name, email, message } }
  );
  
  await client.close();
  return NextResponse.json(result);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const client = await MongoClient.connect(process.env.MONGODB_URI!);
  const db = client.db(process.env.MONGODB_DB);
  
  const result = await db.collection('contacts').deleteOne({
    _id: new ObjectId(id),
  });
  
  await client.close();
  return NextResponse.json(result);
}