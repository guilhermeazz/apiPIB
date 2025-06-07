// src/controllers/UserController.ts
import { Request, Response } from 'express';
import UserModel from '../models/UserModel';

// Listar todos os usuários
export const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await UserModel.find();
        res.status(200).json(users);
    } catch (error: any) {
        res.status(500).json({ message: 'Erro ao buscar usuários', error: error.message });
    }
};

// Obter usuário por ID
export const getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await UserModel.findById(req.params.id);
        if (!user) {
            res.status(404).json({ message: 'Usuário não encontrado' });
            return;
        }
        res.status(200).json(user);
    } catch (error: any) {
        res.status(400).json({ message: 'Erro ao buscar usuário', error: error.message });
    }
};

// Atualizar usuário por ID
export const updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await UserModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!user) {
            res.status(404).json({ message: 'Usuário não encontrado' });
            return;
        }
        res.status(200).json(user);
    } catch (error: any) {
        res.status(400).json({ message: 'Erro ao atualizar usuário', error: error.message });
    }
};

// Deletar usuário por ID
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await UserModel.findByIdAndDelete(req.params.id);
        if (!user) {
            res.status(404).json({ message: 'Usuário não encontrado' });
            return;
        }
        res.status(200).json({ message: 'Usuário deletado com sucesso' });
    } catch (error: any) {
        res.status(400).json({ message: 'Erro ao deletar usuário', error: error.message });
    }
};