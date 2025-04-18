import { CreateStage, SetupStage, type CreateCallback, type SetupCallback } from '@onlook/models';
import type { ImageMessageContext } from '@onlook/models/chat';
import { MainChannels } from '@onlook/models/constants';
import { ipcMain } from 'electron';
import { mainWindow } from '..';
import projectCreator from '../create';
import { getCreateProjectPath } from '../create/helpers';
import { createProject } from '../create/install';
import { installProjectDependencies, reinstallProjectDependencies } from '../create/setup';

export function listenForCreateMessages() {
    ipcMain.handle(MainChannels.GET_CREATE_PROJECT_PATH, (e: Electron.IpcMainInvokeEvent) => {
        return getCreateProjectPath();
    });

    ipcMain.handle(MainChannels.CREATE_NEW_PROJECT, (e: Electron.IpcMainInvokeEvent, args) => {
        const progressCallback: CreateCallback = (stage: CreateStage, message: string) => {
            mainWindow?.webContents.send(MainChannels.CREATE_NEW_PROJECT_CALLBACK, {
                stage,
                message,
            });
        };

        const { name, path } = args as { name: string; path: string };
        return createProject(name, path, progressCallback);
    });

    ipcMain.handle(
        MainChannels.INSTALL_PROJECT_DEPENDENCIES,
        (e: Electron.IpcMainInvokeEvent, args) => {
            const progressCallback: SetupCallback = (stage: SetupStage, message: string) => {
                mainWindow?.webContents.send(MainChannels.SETUP_PROJECT_CALLBACK, {
                    stage,
                    message,
                });
            };
            const { folderPath, installCommand } = args;
            return installProjectDependencies(folderPath, installCommand, progressCallback);
        },
    );

    ipcMain.handle(
        MainChannels.REINSTALL_PROJECT_DEPENDENCIES,
        (e: Electron.IpcMainInvokeEvent, args) => {
            const progressCallback: SetupCallback = (stage: SetupStage, message: string) => {
                mainWindow?.webContents.send(MainChannels.SETUP_PROJECT_CALLBACK, {
                    stage,
                    message,
                });
            };
            const { folderPath, installCommand } = args;
            return reinstallProjectDependencies(folderPath, installCommand, progressCallback);
        },
    );

    ipcMain.handle(
        MainChannels.CREATE_NEW_PROJECT_PROMPT,
        (e: Electron.IpcMainInvokeEvent, args) => {
            const { prompt, images } = args as {
                prompt: string;
                images: ImageMessageContext[];
            };
            return projectCreator.createProject(prompt, images);
        },
    );

    ipcMain.handle(MainChannels.CREATE_NEW_BLANK_PROJECT, (e: Electron.IpcMainInvokeEvent) => {
        return projectCreator.createBlankProject();
    });

    ipcMain.handle(
        MainChannels.CANCEL_CREATE_NEW_PROJECT_PROMPT,
        (e: Electron.IpcMainInvokeEvent) => {
            return projectCreator.cancel();
        },
    );
}
