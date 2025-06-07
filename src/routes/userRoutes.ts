// src/routes/userRoutes.ts
import { Router } from 'express';
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/UserController';
import { validateUserExists } from '../middlewares/user/validateUserExist';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: 'Endpoints para gerenciamento de usuários.'
 */

/**
 * @swagger
 * /user:
 *   get:
 *     tags: [Users]
 *     summary: 'Lista todos os usuários'
 *     description: 'Retorna uma lista de todos os usuários cadastrados.'
 *     responses:
 *       200:
 *         description: 'Lista de usuários retornada com sucesso.'
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: 'Erro interno do servidor.'
 */
router.get('/', getUsers);

/**
 * @swagger
 * /user/{id}:
 *   get:
 *     tags: [Users]
 *     summary: 'Obtém um usuário pelo ID'
 *     description: 'Retorna os dados de um usuário específico.'
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 'ID do usuário.'
 *     responses:
 *       200:
 *         description: 'Usuário encontrado com sucesso.'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: 'Usuário não encontrado.'
 *       400:
 *         description: 'ID inválido.'
 *       500:
 *         description: 'Erro interno do servidor.'
 */
router.get('/:id', getUserById);

/**
 * @swagger
 * /user/{id}:
 *   patch:
 *     tags: [Users]
 *     summary: 'Atualiza um usuário pelo ID'
 *     description: 'Atualiza os dados de um usuário específico.'
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 'ID do usuário a ser atualizado.'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/User'
 *               - type: object
 *                 properties:
 *                   password:
 *                     type: string
 *                     format: password
 *                     description: 'Senha (opcional, para atualização)'
 *     responses:
 *       200:
 *         description: 'Usuário atualizado com sucesso.'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: 'Dados inválidos fornecidos ou ID inválido.'
 *       404:
 *         description: 'Usuário não encontrado.'
 *       409:
 *         description: 'E-mail ou CPF já em uso.'
 *       500:
 *         description: 'Erro interno do servidor.'
 */
router.patch('/:id', updateUser);

/**
 * @swagger
 * /user/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: 'Exclui um usuário pelo ID'
 *     description: 'Remove um usuário específico do banco de dados.'
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 'ID do usuário a ser excluído.'
 *     responses:
 *       200:
 *         description: 'Usuário excluído com sucesso.'
 *       404:
 *         description: 'Usuário não encontrado.'
 *       400:
 *         description: 'ID inválido.'
 *       500:
 *         description: 'Erro interno do servidor.'
 */
router.delete('/:id', deleteUser);

export default router;
