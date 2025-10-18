import {Account, Avatars, Client, Databases, ID, Query, Storage} from "react-native-appwrite";
import {CreateUserParams, GetMenuParams, SignInParams} from "@/type";

export const appwriteConfig = {
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
    platform: "com.Mohammad.foodiefly",
    databaseId: '68d357e3002364c0202d',
    usersCollectionId: 'user',
    categoriesCollectionId: 'c1a2t3e4g5o6r7i9es',
    menuCollectionId: 'm1e2n3u4',
    customizationsCollectionId: 'customizations',
    menuCustomizationsCollectionId: 'menucustomizations',

}

export const client = new Client();

client
    .setEndpoint(appwriteConfig.endpoint!)
    .setProject(appwriteConfig.projectId!)
    .setPlatform(appwriteConfig.platform)
     
export const account = new Account(client);
export const database = new Databases(client);
export const storage = new Storage(client);
export const avatars = new Avatars(client);

export const createUser = async ({ email, password, name }: CreateUserParams) => {
    try {
        const newAccount = await account.create(
            ID.unique(),
            email,
            password,
            name
        );
        if (!newAccount) throw new Error('Account creation failed');

        await signIn({ email, password });
        const avatarUrl = avatars.getInitials(name);

        return await database.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.usersCollectionId,
            ID.unique(),
            { name, email, accountId: newAccount.$id, avatar: avatarUrl }
        );
    } catch (error) {
        throw new Error(error as string);
    }
};
export const signIn = async ({ email, password }: SignInParams) => {
    console.log('signIn called with:', { email, password });
    try {
        
        try {
            await account.deleteSession('current');
        } catch (deleteError) {
           
        }

        const session = await account.createEmailPasswordSession(email, password);
        return session;
    } catch (error) {
        throw new Error(error as string);
    }
};
export const getCurrentUser = async () => {
    try {
        const currentAccount = await account.get();
        console.log('currentAccount:', currentAccount);
        if (!currentAccount) throw new Error('No current account');

        const currentUser = await database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.usersCollectionId,
            [Query.equal('accountId', currentAccount.$id)]
        );
        console.log('currentUser:', currentUser);

        if (!currentUser || !currentUser.documents || currentUser.documents.length === 0) throw new Error('No user found');

        return currentUser.documents[0];
    } catch (error) {
        console.log('getCurrentUser error:', error);
        throw new Error(error as string);
    }
};
export const getMenu = async ({ category, query }: GetMenuParams) => {
    try {
        const queries : string[] = [];
        if (category) {
            queries.push(Query.equal('categories', category));
        }
        if (query) {
            queries.push(Query.search('name', query));
        }
        const menu = await database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.menuCollectionId,
            queries
        );
        return menu.documents;
    } catch (error) {
        throw new Error(error as string);
    }    
};

export const getCategories = async () => {
    try {
        const categories = await database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.categoriesCollectionId
        );
        return categories.documents;
    } catch (error) {
        throw new Error(error as string);
    }
};