import { HttpService } from '@nestjs/axios';
import { Controller, Get, HttpException, HttpStatus, Query } from '@nestjs/common';
import { response } from 'express';
import { stringify } from 'querystring';
import { firstValueFrom, identity, map } from 'rxjs';

enum SortBy {
    ID = 'id',
    READS = 'reads',
    LIKES = 'likes',
    POPULARITY = 'popularity'
};

enum Direction {
    ASC = 'asc',
    DESC = 'desc'
};
@Controller('api')
export class ApiController {
    constructor(private httpService: HttpService) { }
    @Get('ping')
    async ping() {
        return ({
            success: true
        });
    }

    @Get('posts')
    async getposts(@Query('tags') tags: string, @Query('sortBy') sortBy: SortBy=SortBy.ID, @Query('direction') direction: Direction=Direction.ASC) {
        if (tags) {
            const tagsSplit = tags.split(',');
            let posts = [];

            for (const tag of tagsSplit) {
                const data = (await firstValueFrom(this.httpService.get(`https://api.hatchways.io/assessment/blog/posts?tag=${tag}`))).data;
                posts = posts.concat(data.posts);
            }
            posts=posts.filter((post,i)=>posts.findIndex(p=>post.id===p.id)===i);
            if(direction!==Direction.ASC && direction!==Direction.DESC) throw new HttpException({error:"sortBy parameter is invalid"},HttpStatus.BAD_REQUEST);
            switch (sortBy){
                case SortBy.ID:
                    return posts.sort((a,b)=>direction === Direction.ASC ? a.id - b.id : b.id - a.id);
                case SortBy.READS:
                    return posts.sort((a,b)=>direction === Direction.ASC ? a.reads - b.reads : b.reads - a.reads);
                case SortBy.POPULARITY:
                    return posts.sort((a,b)=>direction === Direction.ASC ? a.popularity - b.popularity : b.popularity - a.popularity);
                case SortBy.LIKES:
                    return posts.sort((a,b)=>direction === Direction.ASC ? a.likes - b.likes : b.likes - a.likes);
                default:
                    throw new HttpException({error:"sortBy parameter is invalid"},HttpStatus.BAD_REQUEST);
            }
        }else{
            throw new HttpException({error:"Tags parameter is required"},HttpStatus.BAD_REQUEST);
        }

    }
}
