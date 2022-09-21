import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { isValidObjectId, Model } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';

import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';



@Injectable()
export class PokemonService {

  constructor(
    @InjectModel( Pokemon.name )
    private readonly pokemonModel: Model<Pokemon>
  ) {};

  async create(createPokemonDto: CreatePokemonDto) {
    //return 'This action adds a new pokemon';
    try {
      createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();
      const pokemon = await this.pokemonModel.create( createPokemonDto );
      return pokemon;
    }
    catch(error) {
      this.handleExceptions(error);
    }
  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(id: string) {
    //return `This action returns a #${id} pokemon`;   
    let pokemon: Pokemon;

    // busqueda por no
    if(!isNaN(+id)) {
      pokemon = await this.pokemonModel.findOne({no: id});
    }

    //busqueda por mongoID
    if( !pokemon && isValidObjectId(id)){
      pokemon = await this.pokemonModel.findById(id);
    }

    //busqueda por Name
    if( !pokemon ){
      pokemon = await this.pokemonModel.findOne({name: id.toLowerCase().trim()});
    }    

    if(!pokemon) throw new NotFoundException(`Pokemon with id, name or no "${id}" not found`);

    return pokemon;
  }

  async update(id: string, updatePokemonDto: UpdatePokemonDto) {
    //return `This action updates a #${id} pokemon`;
    const pokemon = await  this.findOne(id);
    if(updatePokemonDto.name)
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase();

      try {
        await pokemon.updateOne(updatePokemonDto, { new: true});
        return { ...pokemon.toJSON(), ...updatePokemonDto };
      }
      catch(error) {
        this.handleExceptions(error);
      }


  }

  async remove(id: string) {
    //return `This action removes a #${id} pokemon`;
    //const pokemon = await this.findOne( id );
    // Forma 1   
    //await pokemon.deleteOne();
    // Forma 2
    //const result = await this.pokemonModel.findByIdAndDelete(id) 
    // Forma 3
    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id });
    if ( deletedCount === 0 )
      throw new BadRequestException(`Pokemon with id "${ id }" not found`);

    return;
  }


  private handleExceptions( error: any ) {
    if ( error.code === 11000 ) {
      throw new BadRequestException(`Pokemon exists in db ${ JSON.stringify( error.keyValue ) }`);
    }
    console.log(error);
    throw new InternalServerErrorException(`Can't create Pokemon - Check server logs`);
  }

}
