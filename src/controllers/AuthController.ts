// src/controllers/AuthController.ts
import { Request, Response } from "express";
import UserModel from '../models/UserModel';
import bcrypt from 'bcrypt';

// Função para fazer Login
export const login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    try {
        const user = await UserModel.findOne({
            email
        });
        if (!user) {
            res.status(404).json({ message: "Usuário não encontrado" });
            return;
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ message: 'Senha inválida' });
            return;
        }
        // Não gera JWT, apenas indica sucesso
        res.status(200).json({
            message: 'Login realizado com sucesso!',
            user: {
                id: user?._id,
                email: user?.email,
                name: user?.name,
                lastname: user?.lastname,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao fazer login', error });
    }
};

// Função para fazer Cadastro
export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const newUser = new UserModel(req.body);
        await newUser.save();
        res.status(201).json({ message: 'Cadastro realizado com sucesso!', user: newUser });
    } catch (error: any) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err: any) => err.message);
            res.status(400).json({ message: 'Erro de validação no cadastro', errors: messages });
        } else if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            res.status(409).json({ message: `O campo '${field}' já está em uso.` });
        } else {
            res.status(500).json({ message: 'Erro ao realizar o cadastro', error: error.message });
        }
    }
};